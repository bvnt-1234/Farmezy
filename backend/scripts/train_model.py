import os
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Paths
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(ROOT, "data", "historical_mandi_prices_3years.csv")
MODELS_DIR = os.path.join(ROOT, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

MODEL_FILE = os.path.join(MODELS_DIR, "farmezy_price_model.joblib")
METADATA_FILE = os.path.join(MODELS_DIR, "model_metadata.json")
INFERENCE_FILE = os.path.join(MODELS_DIR, "price_forecasts_2025_2026.json")

def load_data():
    df = pd.read_csv(DATA_PATH)
    return df

def train_and_evaluate():
    df = load_data()
    print("=================================================================")
    print("   FARMEZY MANDI PRICE FORECASTING — MODEL BENCHMARK PIPELINE    ")
    print("=================================================================")
    print(f"Total records in dataset: {len(df)}")
    print(f"Years: {sorted(df['Year'].unique())}")
    print(f"States: {df['State'].nunique()} | Commodities: {df['Commodity'].nunique()}")

    # 1. Temporal split: 2023-2024 for Training (448 rows), 2025 for Testing (224 rows)
    train_df = df[df['Year'] < 2025].copy().sort_values(['State', 'Commodity', 'Year']).reset_index(drop=True)
    test_df = df[df['Year'] == 2025].copy().sort_values(['State', 'Commodity']).reset_index(drop=True)

    print(f"Training split (2023-2024): {len(train_df)} rows")
    print(f"Held-out test split (2025): {len(test_df)} rows")

    # Target variable
    y_test = test_df['Average Wholesale Price (INR/Quintal)'].values

    # 2. Strict Data Leakage Prevention: Features & Encoders calculated on TRAIN ONLY
    train_df['log_price'] = np.log(train_df['Average Wholesale Price (INR/Quintal)'])
    test_df['log_price'] = np.log(test_df['Average Wholesale Price (INR/Quintal)'])

    # Categorical One-Hot Encoder (State + Commodity)
    ohe = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
    ohe.fit(train_df[['State', 'Commodity']])

    # Training commodity statistics
    comm_log_means = train_df.groupby('Commodity')['log_price'].mean().to_dict()
    state_log_means = train_df.groupby('State')['log_price'].mean().to_dict()
    overall_log_mean = float(train_df['log_price'].mean())
    state_log_diff = {s: state_log_means[s] - overall_log_mean for s in state_log_means}

    # Training commodity-specific log growth slope (2023 -> 2024)
    p23_comm = train_df[train_df['Year'] == 2023].groupby('Commodity')['log_price'].mean()
    p24_comm = train_df[train_df['Year'] == 2024].groupby('Commodity')['log_price'].mean()
    comm_trend_slope = (p24_comm - p23_comm).to_dict()

    # Previous observed price for persistence baselines and lag features
    p2024_lookup = train_df[train_df['Year'] == 2024].set_index(['State', 'Commodity'])['Average Wholesale Price (INR/Quintal)'].to_dict()

    # Feature transformation function using strictly training metadata
    def build_features(d):
        cats = ohe.transform(d[['State', 'Commodity']])
        t = (d['Year'].values - 2023).astype(float).reshape(-1, 1)
        c_mean = d['Commodity'].map(comm_log_means).values.astype(float).reshape(-1, 1)
        s_diff = d['State'].map(state_log_diff).values.astype(float).reshape(-1, 1)
        c_slope = d['Commodity'].map(comm_trend_slope).values.astype(float).reshape(-1, 1)
        c_trend = (c_slope * t)

        # Commodity-time interaction terms (commodity one-hot starts at index 28)
        comm_cats = cats[:, 28:]
        comm_time_interactions = comm_cats * t

        return np.hstack([cats, t, c_mean, s_diff, c_slope, c_trend, comm_time_interactions])

    X_train = build_features(train_df)
    y_train = train_df['log_price'].values

    X_test = build_features(test_df)

    # 3. Model 0A: Naive Persistence Baseline (P_2025 = P_2024)
    pred_naive = np.array([p2024_lookup[(row['State'], row['Commodity'])] for _, row in test_df.iterrows()])

    # Model 0B: Trend-Adjusted Persistence Baseline (P_2025 = P_2024 * exp(comm_growth_train))
    pred_trend_base = np.array([
        p2024_lookup[(row['State'], row['Commodity'])] * np.exp(comm_trend_slope[row['Commodity']])
        for _, row in test_df.iterrows()
    ])

    # Model 1: Ridge Regression (L2 Regularized with log target)
    ridge = Ridge(alpha=5.0)
    ridge.fit(X_train, y_train)
    pred_ridge = np.exp(ridge.predict(X_test))

    # Model 2: Random Forest Regressor
    rf = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
    rf.fit(X_train, y_train)
    pred_rf = np.exp(rf.predict(X_test))

    # Model 3: Gradient Boosting Regressor
    gb = GradientBoostingRegressor(n_estimators=100, learning_rate=0.08, max_depth=3, random_state=42)
    gb.fit(X_train, y_train)
    pred_gb = np.exp(gb.predict(X_test))

    # 4. Metric Computation
    models_dict = {
        "Naive Persistence Baseline": pred_naive,
        "Trend Persistence Baseline": pred_trend_base,
        "Ridge Regression (Log)": pred_ridge,
        "Random Forest Regressor": pred_rf,
        "Gradient Boosting Regressor": pred_gb
    }

    results = []
    print("\n------------------------------------------------------------------------------------------------------")
    print(f"{'Model Name':30s} | {'MAE (INR)':10s} | {'RMSE (INR)':10s} | {'MAPE (%)':10s} | {'R^2':8s} | {'Min Pred':10s} | {'Max Pred':10s}")
    print("------------------------------------------------------------------------------------------------------")

    for name, preds in models_dict.items():
        mae = mean_absolute_error(y_test, preds)
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        mape = np.mean(np.abs((y_test - preds) / y_test)) * 100
        r2 = r2_score(y_test, preds)
        min_p = float(preds.min())
        max_p = float(preds.max())
        neg_count = int(np.sum(preds <= 0))

        results.append({
            "model": name,
            "mae": round(float(mae), 2),
            "rmse": round(float(rmse), 2),
            "mape": round(float(mape), 2),
            "r2": round(float(r2), 4),
            "min_prediction": round(min_p, 2),
            "max_prediction": round(max_p, 2),
            "negative_predictions": neg_count
        })

        print(f"{name:30s} | {mae:10.2f} | {rmse:10.2f} | {mape:9.2f}% | {r2:8.4f} | {min_p:10.2f} | {max_p:10.2f}")
    print("------------------------------------------------------------------------------------------------------")

    # 5. Commodity Breakdown for the Winning Model (Ridge)
    test_df['pred_ridge'] = pred_ridge
    print("\nCommodity Breakdown for Winning Model (Ridge Regression):")
    print(f"{'Commodity':20s} | {'Unit':18s} | {'Actual Avg':10s} | {'Pred Avg':10s} | {'MAE (INR)':10s} | {'MAPE (%)':10s}")
    print("------------------------------------------------------------------------------------------------")
    comm_breakdown = {}
    for comm, grp in test_df.groupby('Commodity'):
        act = grp['Average Wholesale Price (INR/Quintal)'].values
        prd = grp['pred_ridge'].values
        c_mae = mean_absolute_error(act, prd)
        c_mape = np.mean(np.abs((act - prd) / act)) * 100
        unit = grp['Unit'].iloc[0]
        comm_breakdown[comm] = {
            "unit": unit,
            "actual_mean": round(float(np.mean(act)), 2),
            "predicted_mean": round(float(np.mean(prd)), 2),
            "mae": round(float(c_mae), 2),
            "mape": round(float(c_mape), 2)
        }
        print(f"{comm:20s} | {unit:18s} | {np.mean(act):10.2f} | {np.mean(prd):10.2f} | {c_mae:10.2f} | {c_mape:9.2f}%")
    print("------------------------------------------------------------------------------------------------")

    # 6. Save Artifacts
    # Save scikit-learn model pipeline & encoders
    pipeline_artifact = {
        "model": ridge,
        "ohe": ohe,
        "comm_log_means": comm_log_means,
        "state_log_diff": state_log_diff,
        "comm_trend_slope": comm_trend_slope,
        "feature_fn_info": "build_features_trend_tab"
    }
    joblib.dump(pipeline_artifact, MODEL_FILE)
    print(f"\n[Saved] Scikit-Learn Model Artifact -> {MODEL_FILE}")

    # Generate complete fast inference lookup table for 2025 and 2026 forecast
    # This allows Farmezy backend (Node.js) to serve predictions sub-millisecond without python child processes
    forecast_table = {}
    states = sorted(df['State'].unique())
    commodities = sorted(df['Commodity'].unique())

    # Build 2025 & 2026 feature vectors for inference
    inf_rows_2025 = []
    inf_rows_2026 = []
    pair_keys = []

    for s in states:
        for c in commodities:
            inf_rows_2025.append({"State": s, "Commodity": c, "Year": 2025})
            inf_rows_2026.append({"State": s, "Commodity": c, "Year": 2026})
            pair_keys.append((s, c))

    df_inf_25 = pd.DataFrame(inf_rows_2025)
    df_inf_26 = pd.DataFrame(inf_rows_2026)

    X_inf_25 = build_features(df_inf_25)
    X_inf_26 = build_features(df_inf_26)

    preds_25 = np.exp(ridge.predict(X_inf_25))
    preds_26 = np.exp(ridge.predict(X_inf_26))

    for idx, (s, c) in enumerate(pair_keys):
        p25 = round(float(preds_25[idx]), 2)
        p26 = round(float(preds_26[idx]), 2)
        unit = "Tonne" if c == "Sugarcane" else "Quintal (100 KG)"
        hist_23 = round(float(train_df[(train_df['State'] == s) & (train_df['Commodity'] == c) & (train_df['Year'] == 2023)]['Average Wholesale Price (INR/Quintal)'].values[0]), 2)
        hist_24 = round(float(train_df[(train_df['State'] == s) & (train_df['Commodity'] == c) & (train_df['Year'] == 2024)]['Average Wholesale Price (INR/Quintal)'].values[0]), 2)
        test_act_25 = round(float(test_df[(test_df['State'] == s) & (test_df['Commodity'] == c)]['Average Wholesale Price (INR/Quintal)'].values[0]), 2)

        key = f"{s.lower().strip()}|{c.lower().strip()}"
        forecast_table[key] = {
            "state": s,
            "commodity": c,
            "unit": unit,
            "history": {
                "2023": hist_23,
                "2024": hist_24,
                "2025_actual": test_act_25
            },
            "predicted_2025": p25,
            "predicted_2026": p26,
            "expected_annual_drift_percent": round(((p26 - p25) / p25) * 100, 2),
            "uncertainty_band": {
                "lower_bound_2026": round(p26 * 0.88, 2),
                "upper_bound_2026": round(p26 * 1.12, 2)
            }
        }

    with open(INFERENCE_FILE, "w", encoding="utf-8") as f:
        json.dump(forecast_table, f, indent=2)
    print(f"[Saved] Fast Inference Lookup Table -> {INFERENCE_FILE}")

    metadata = {
        "dataset": "historical_mandi_prices_3years.csv",
        "training_years": [2023, 2024],
        "test_year": 2025,
        "training_rows": len(train_df),
        "test_rows": len(test_df),
        "model_comparison": results,
        "winning_model": "Ridge Regression (Log)",
        "commodity_breakdown": comm_breakdown,
        "files_generated": [MODEL_FILE, METADATA_FILE, INFERENCE_FILE]
    }

    with open(METADATA_FILE, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"[Saved] Benchmark Metadata -> {METADATA_FILE}")

    return metadata

if __name__ == "__main__":
    train_and_evaluate()

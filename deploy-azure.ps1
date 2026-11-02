<#
.SYNOPSIS
  Farmezy 1-Click Azure Deployment Script (Azure Student Pack compatible)
.DESCRIPTION
  Automates the entire Azure deployment process:
  - Verifies Azure CLI (installs if missing)
  - Logs you into your Azure Student account (browser prompt)
  - Builds the frontend and prepares the backend
  - Provisions an Azure App Service on the Free F1 tier (0 cost)
  - Deploys Farmezy and provides the live HTTPS link
#>

$ErrorActionPreference = "Stop"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "       Farmezy 1-Click Azure Deployment Script        " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

# Step 1: Check for Azure CLI
Write-Host "`n[Step 1/5] Checking Azure CLI..." -ForegroundColor Yellow
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Host "Azure CLI not found. Installing via winget (this takes ~1 minute)..." -ForegroundColor Yellow
    winget install -e --id Microsoft.AzureCLI --silent --accept-source-agreements --accept-package-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
        Write-Host "Please restart your PowerShell terminal and run .\deploy-azure.ps1 again to refresh PATH." -ForegroundColor Red
        exit 1
    }
}
Write-Host "Azure CLI is ready." -ForegroundColor Green

# Step 2: Sign in to Azure Student Account
Write-Host "`n[Step 2/5] Signing in to your Azure Student Pack account..." -ForegroundColor Yellow
Write-Host "Your browser will open automatically. Sign in with your university/student Microsoft account." -ForegroundColor Cyan
az login

# Set active subscription if multiple exist
$subscriptions = az account list --query "[].{name:name, id:id, isDefault:isDefault}" -o json | ConvertFrom-Json
if ($subscriptions.Count -gt 1) {
    Write-Host "Multiple subscriptions found. Selecting your student subscription..." -ForegroundColor Yellow
    $studentSub = $subscriptions | Where-Object { $_.name -match "Student" } | Select-Object -First 1
    if ($studentSub) {
        az account set --subscription $studentSub.id
        Write-Host "Using subscription: $($studentSub.name)" -ForegroundColor Green
    }
}

# Step 3: Build frontend production bundle
Write-Host "`n[Step 3/5] Building Farmezy production bundle..." -ForegroundColor Yellow
npm --prefix frontend install
npm --prefix frontend run build
Write-Host "Frontend build complete." -ForegroundColor Green

# Step 4: Provision & Deploy to Azure App Service
Write-Host "`n[Step 4/5] Deploying to Azure App Service (Free F1 Tier)..." -ForegroundColor Yellow
$randomSuffix = Get-Random -Minimum 1000 -Maximum 9999
$appName = "farmezy-$randomSuffix"
$rgName = "Farmezy-RG"
$location = "eastus"

Write-Host "Creating and deploying web app: $appName in $rgName ($location)..." -ForegroundColor Cyan

# Deploy entire project using az webapp up
az webapp up --resource-group $rgName --name $appName --location $location --sku F1 --runtime "NODE:20-lts"

# Step 5: Configure Port and Startup command
Write-Host "`n[Step 5/5] Configuring environment settings..." -ForegroundColor Yellow
az webapp config appsettings set --resource-group $rgName --name $appName --settings SCM_DO_BUILD_DURING_DEPLOYMENT="true" NODE_ENV="production" > $null

Write-Host "`n======================================================" -ForegroundColor Green
Write-Host "🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "Your Farmezy app is live at:" -ForegroundColor Cyan
Write-Host "https://$appName.azurewebsites.net" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green


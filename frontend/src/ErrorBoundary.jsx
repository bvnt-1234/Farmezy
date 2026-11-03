import React from "react"

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Farmezy Uncaught Error:", error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleResetStorage = () => {
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch (e) {}
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f4f7f4",
          fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
          padding: 20
        }}>
          <div style={{
            maxWidth: 520,
            width: "100%",
            backgroundColor: "#ffffff",
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
            border: "1px solid #dce6dc",
            textAlign: "center"
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: "#e8f5e9",
              color: "#2e7d32",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              margin: "0 auto 16px auto",
              fontWeight: 800
            }}>
              f
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1b3320", margin: "0 0 8px 0" }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: 14, color: "#4f6b55", margin: "0 0 24px 0", lineHeight: 1.5 }}>
              Farmezy encountered a temporary issue while starting up. Please reload the page to continue.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20 }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  backgroundColor: "#2e7d32",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 24px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Reload Farmezy
              </button>
              <button
                type="button"
                onClick={this.handleResetStorage}
                style={{
                  backgroundColor: "#ffffff",
                  color: "#4f6b55",
                  border: "1px solid #c8d8c9",
                  borderRadius: 10,
                  padding: "10px 18px",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer"
                }}
              >
                Reset Cache & Reload
              </button>
            </div>
            {this.state.error && (
              <details style={{ textAlign: "left", marginTop: 16, backgroundColor: "#fafdfa", border: "1px solid #e1ebe2", borderRadius: 8, padding: 12 }}>
                <summary style={{ cursor: "pointer", fontSize: 12, color: "#6c8572", fontWeight: 600 }}>
                  View technical error details
                </summary>
                <pre style={{ fontSize: 11, color: "#d32f2f", whiteSpace: "pre-wrap", wordBreak: "break-all", margin: "8px 0 0 0", fontFamily: "monospace" }}>
                  {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

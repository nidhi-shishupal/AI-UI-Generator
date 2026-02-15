import { useState, useEffect } from "react";
import Card from "./components/Card";
import Input from "./components/Input";
import Button from "./components/Button";
import Modal from "./components/Modal";
import Particles from "react-tsparticles";

const componentMap = { Card, Input, Button, Modal };
const BASE = "http://localhost:5000/api/v1";

function renderComponent(component, path = "0") {
  if (!component || !component.type) return null;

  const Component = componentMap[component.type];
  if (!Component) return null;

  const children = (component.children || []).map((child, i) =>
    renderComponent(child, `${path}-${i}`)
  );

  return (
    <Component key={path} {...component.props}>
      {children}
    </Component>
  );
}

function App() {
  const [prompt, setPrompt] = useState("");
  const [plan, setPlan] = useState(null);
  const [code, setCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [history, setHistory] = useState([]);
  const [promptHistory, setPromptHistory] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [viewJSON, setViewJSON] = useState(false);
  const [device, setDevice] = useState("desktop");

  const rollback = (index) => {
    if (history[index]) {
      setPlan(history[index]);
      setCurrentVersion(index);
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);

      const planRes = await fetch(`${BASE}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt: prompt,
          previousPlan: plan
        })
      });

      const planData = await planRes.json();
      if (!planData.plan) throw new Error("Plan failed");

      setPlan(planData.plan);
      setPromptHistory(prev => [prompt, ...prev.slice(0, 4)]);

      setHistory(prev => {
        const updated = [...prev.slice(0, currentVersion + 1), planData.plan];
        setCurrentVersion(updated.length - 1);
        return updated;
      });

      const genRes = await fetch(`${BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planData.plan })
      });

      const genData = await genRes.json();
      setCode(genData.code || "");

      const expRes = await fetch(`${BASE}/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planData.plan,
          userPrompt: prompt
        })
      });

      const expData = await expRes.json();
      setExplanation(expData.explanation || "");

      // AI Suggestions (simple heuristic assistant)
      const lower = prompt.toLowerCase();
      let tips = [];

      if (lower.includes("login") && !lower.includes("remember")) {
        tips.push("Try adding: remember me checkbox");
      }

      if (lower.includes("dashboard") && !lower.includes("chart")) {
        tips.push("Dashboards look better with charts or stats cards");
      }

      if (lower.includes("form") && !lower.includes("validation")) {
        tips.push("You may want validation messages");
      }

      if (tips.length > 0) {
        setExplanation(prev => prev + "\n\n💡 Suggestions:\n- " + tips.join("\n- "));
      }

      if (loading) return;
    } catch (err) {
      alert("Failed to generate UI. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const previewWidth =
    device === "mobile" ? "375px" :
      device === "tablet" ? "768px" :
        "100%";

  const renderLayout = () => {
    if (!plan) return <p>Your generated UI will appear here.</p>;

    switch (plan.layout) {
      case "centered-card":
        return (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ maxWidth: "400px", width: "100%" }}>
              {plan.components.map((c, i) => renderComponent(c, String(i)))}
            </div>
          </div>
        );
      case "two-column":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {plan.components.map((c, i) => renderComponent(c, String(i)))}
          </div>
        );
      case "dashboard":
        return (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
            width: "100%"
          }}>
            {plan.components.map((c, i) => renderComponent(c, String(i)))}
          </div>
        );

      default:
        if (!plan)
          return (
            <div style={{
              opacity: 0.6,
              textAlign: "center",
              padding: "60px 20px"
            }}>
              ✨ Describe a UI in the left panel and click Generate UI
            </div>
          );
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {plan.components.map((c, i) => renderComponent(c, String(i)))}
          </div>
        );
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      overflowX: "hidden",
      overflowY: "auto",
      background: "radial-gradient(circle at 20% 20%, #1e293b, #0f172a)",
      fontFamily: "Inter, sans-serif",
      color: "#e5e7eb"
    }}>

      <Particles
        options={{
          particles: {
            number: { value: 40 },
            size: { value: 2 },
            move: { speed: 0.3 },
            opacity: { value: 0.3 },
            color: { value: "#3b82f6" }
          }
        }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0
        }}
      />

      {/* TOP BAR */}
      <div style={{
        padding: "25px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <h1>⚡ AI Control Panel</h1>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>
            {loading ? "AI is designing your UI..." : "Ready"}
          </div>
        </div>
        <span style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: loading ? "#facc15" : "#22c55e"
        }} />
      </div>

      {/* MAIN GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "320px minmax(600px,1.6fr) minmax(380px,1fr)",
        gap: "30px",
        padding: "0 40px 40px 40px",
        maxWidth: "1600px",
        margin: "0 auto"
      }}>

        {/* LEFT */}
        <GlassCard>
          <h3>AI Chat</h3>

          <div style={{
            fontSize: "12px",
            opacity: 0.7,
            marginBottom: "8px",
            lineHeight: "1.4"
          }}>
          </div>

          {/* Prompt Suggestions */}
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "13px", opacity: 0.7, marginBottom: "6px" }}>
              Try examples:
            </div>
            {[
              "Login form with remember me",
              "User profile card",
              "Admin dashboard with stats",
              "Contact form with message box",
              "Settings page with modal"
            ].map((ex, i) => (
              <button
                key={i}
                onClick={() => setPrompt(ex)}
                style={{
                  margin: "4px",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  border: "1px solid rgba(59,130,246,0.4)",
                  background: "#0b1220",
                  color: "#93c5fd",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                {ex}
              </button>
            ))}
          </div>

          <textarea
            rows={5}
            placeholder="Describe the UI you want..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={inputStyle}
          />

          <div style={{ marginBottom: "10px" }}>
            <small style={{ opacity: 0.6 }}>Quick add:</small>
            {["remember me", "forgot password", "profile avatar", "statistics cards"].map(s => (
              <button
                key={s}
                style={{ ...deviceButton, fontSize: "12px", margin: "4px" }}
                onClick={() => setPrompt(p => p + " " + s)}
              >
                + {s}
              </button>
            ))}
          </div>

          <button onClick={handleGenerate} style={neonButton}>
            {loading ? "Generating..." : "Generate UI"}
          </button>

          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
            <button
              onClick={() => setPrompt("")}
              style={deviceButton}
            >
              Clear
            </button>

            <button
              onClick={() => setPrompt(prev => prev + " modern clean minimal UI")}
              style={deviceButton}
            >
              Improve Prompt
            </button>
          </div>

          {history.length > 0 && (
            <>
              <h4 style={{ marginTop: "20px" }}>Versions</h4>
              {history.map((_, index) => (
                <button
                  key={index}
                  onClick={() => rollback(index)}
                  style={{
                    marginRight: "5px",
                    background: index === currentVersion ? "#2563eb" : "#334155",
                    color: "#fff",
                    border: "none",
                    padding: "5px 8px",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  v{index + 1}
                </button>
              ))}
            </>
          )}

          {promptHistory.length > 0 && (
            <>
              <h4 style={{ marginTop: "20px" }}>Recent Prompts</h4>
              {promptHistory.map((p, i) => (
                <div
                  key={i}
                  onClick={() => setPrompt(p)}
                  style={{
                    padding: "6px",
                    marginBottom: "6px",
                    background: "#020617",
                    borderRadius: "6px",
                    cursor: "pointer",
                    color: "#94a3b8",
                    fontSize: "13px"
                  }}
                >
                  {p}
                </div>
              ))}
            </>
          )}

        </GlassCard>

        {/* CENTER */}
        <GlassCard>
          <h3>Live Preview</h3>
          {loading && (
            <div style={{
              position: "absolute",
              inset: 0,
              background: "rgba(2,6,23,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "16px",
              fontSize: "18px"
            }}>
              Generating UI...
            </div>
          )}

          <div style={{ marginBottom: "15px" }}>
            <button onClick={() => setDevice("desktop")} style={deviceButton}>Desktop</button>
            <button onClick={() => setDevice("tablet")} style={deviceButton}>Tablet</button>
            <button onClick={() => setDevice("mobile")} style={deviceButton}>Mobile</button>
          </div>

          <div style={{
            padding: "30px",
            background: "#0b1220",
            borderRadius: "16px",
            overflow: "visible",
            maxHeight: "600px"
          }}>

            <div style={{
              width: "100%",
              maxWidth: previewWidth,
              margin: "0 auto"
            }}>
              {renderLayout()}
            </div>
          </div>

        </GlassCard>

        {/* RIGHT */}
        <GlassCard>
          <h3>Inspector</h3>

          <button onClick={() => setViewJSON(!viewJSON)} style={deviceButton}>
            {viewJSON ? "Show Explanation" : "Show JSON"}
          </button>

          <div style={{ marginTop: "15px", maxHeight: "500px", overflowY: "auto" }}>
            {viewJSON
              ? <pre style={codeStyle}>{JSON.stringify(plan, null, 2)}</pre>
              : <TypeWriter text={explanation || ""} />
            }
          </div>

          <h4 style={{ marginTop: "20px" }}>Generated Code</h4>
          <button
            style={{ ...deviceButton, marginBottom: "10px" }}
            onClick={() => navigator.clipboard.writeText(code)}
          >
            Copy Code
          </button>
          <pre style={codeStyle}>{code}</pre>
        </GlassCard>

      </div>
    </div>
  );
}

export default App;

/* TYPEWRITER */
function TypeWriter({ text }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      setDisplayed(prev => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [text]);

  return <div style={{ whiteSpace: "pre-wrap" }}>{displayed}</div>;
}

/* STYLES */
function GlassCard({ children }) {
  return (
    <div style={{
      background: "rgba(30,41,59,0.6)",
      backdropFilter: "blur(12px)",
      padding: "25px",
      borderRadius: "20px",
      border: "1px solid rgba(59,130,246,0.4)",
      boxShadow: "0 0 25px rgba(59,130,246,0.2)"
    }}>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid rgba(59,130,246,0.4)",
  background: "#0b1220",
  color: "#e5e7eb",
  marginBottom: "15px"
};

const neonButton = {
  padding: "10px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(90deg,#3b82f6,#6366f1)",
  color: "white",
  cursor: "pointer",
  boxShadow: "0 0 15px rgba(59,130,246,0.6)"
};

const deviceButton = {
  marginRight: "5px",
  padding: "6px 10px",
  borderRadius: "8px",
  border: "1px solid rgba(59,130,246,0.4)",
  background: "#0b1220",
  color: "#e5e7eb",
  cursor: "pointer"
};

const codeStyle = {
  background: "#0b1220",
  color: "#22c55e",
  padding: "16px",
  borderRadius: "12px",
  overflow: "auto",
  fontSize: "13px"
};

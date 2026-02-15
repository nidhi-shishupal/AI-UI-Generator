export default function Button({ label }) {
  return (
    <button style={{
      padding: "10px 14px",
      borderRadius: "10px",
      border: "none",
      background: "linear-gradient(90deg,#3b82f6,#6366f1)",
      color: "white",
      cursor: "pointer",
      fontSize: "14px",
      width: "100%"
    }}>
      {label || "Button"}
    </button>
  );
}

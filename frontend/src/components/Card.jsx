export default function Card({ title, children }) {
    return (
        <div style={{
            padding: "18px",
            borderRadius: "18px",
            background: "linear-gradient(180deg,#020617,#020617)",
            border: "1px solid rgba(59,130,246,0.35)",
            boxShadow: "0 0 25px rgba(59,130,246,0.15)",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            minHeight: "120px"
        }}>

            {/* Title */}
            <div style={{
                fontWeight: "600",
                fontSize: "18px",
                color: "#e2e8f0"
            }}>
                {title || "Card"}
            </div>

            {/* CONTENT (THIS WAS MISSING) */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px"
            }}>
                {children}
            </div>

        </div>
    );
}

export default function Card({ label, children }) {
    return (
        <div
            style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                marginBottom: "20px",
                width: "350px"
            }}
        >
            <h3 style={{ marginBottom: "15px" }}>{label}</h3>
            {children}
        </div>
    );
}

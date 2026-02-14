export default function Input({ label }) {
    return (
        <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "14px" }}>{label}</label>
            <input
                style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "4px",
                    borderRadius: "6px",
                    border: "1px solid #ccc"
                }}
            />
        </div>
    );
}

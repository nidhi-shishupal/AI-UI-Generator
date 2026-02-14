export default function Button({ label }) {
    return (
        <button
            style={{
                width: "100%",
                padding: "10px",
                marginTop: "10px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#2563eb",
                color: "white",
                cursor: "pointer"
            }}
        >
            {label}
        </button>
    );
}

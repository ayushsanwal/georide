import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>GeoRide 🚕</h1>

        <p style={styles.subtitle}>
          Intelligent Cab Booking with Real-time Tracking
        </p>

        <div style={styles.buttons}>
          <button
            style={styles.primaryBtn}
            onClick={() => navigate("/rider")}
          >
            Book a Ride
          </button>

          <button
            style={styles.secondaryBtn}
            onClick={() => navigate("/driver")}
          >
            Drive with Us
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #020617, #0f172a)",
  },

  card: {
    background: "rgba(255,255,255,0.05)",
    padding: "60px",
    borderRadius: "20px",
    textAlign: "center",
    backdropFilter: "blur(12px)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
    width: "420px",
  },

  title: {
    fontSize: "56px",
    fontWeight: "700",
    color: "#ffffff",
  },

  subtitle: {
    marginTop: "10px",
    marginBottom: "40px",
    fontSize: "16px",
    color: "#94a3b8",
  },

  buttons: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  primaryBtn: {
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #00c896, #00a67d)",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },

  secondaryBtn: {
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #334155",
    background: "transparent",
    color: "#e2e8f0",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default Home;
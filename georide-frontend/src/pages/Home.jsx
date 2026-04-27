import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDriverId, getRiderId } from "../services/api";

const makeId = (prefix) => {
  return `${prefix}_${Math.random().toString(36).substring(2, 8)}`;
};

const Home = () => {
  const navigate = useNavigate();
  const [riderId, setRiderId] = useState(() => getRiderId());
  const [driverId, setDriverId] = useState(() => getDriverId());

  const continueAsRider = () => {
    localStorage.setItem("riderId", riderId.trim() || makeId("r"));
    navigate("/rider");
  };

  const continueAsDriver = () => {
    localStorage.setItem("driverId", driverId.trim() || makeId("d"));
    navigate("/driver");
  };

  const resetRider = () => {
    const nextId = makeId("r");
    localStorage.setItem("riderId", nextId);
    setRiderId(nextId);
  };

  const resetDriver = () => {
    const nextId = makeId("d");
    localStorage.setItem("driverId", nextId);
    setDriverId(nextId);
  };

  return (
    <main style={styles.container}>
      <section style={styles.content}>
        <div>
          <p style={styles.kicker}>Real-time ride matching</p>
          <h1 style={styles.title}>GeoRide</h1>
          <p style={styles.subtitle}>
            Book a ride, match with the nearest available driver, and track the
            trip from pickup to destination.
          </p>
        </div>

        <div style={styles.roles}>
          <div style={styles.rolePanel}>
            <h2 style={styles.roleTitle}>Rider</h2>
            <label style={styles.label} htmlFor="rider-id">Rider ID</label>
            <input
              id="rider-id"
              value={riderId}
              onChange={(event) => setRiderId(event.target.value)}
              style={styles.input}
            />
            <div style={styles.roleActions}>
              <button style={styles.primaryBtn} onClick={continueAsRider}>
                Continue as Rider
              </button>
              <button style={styles.secondaryBtn} onClick={resetRider}>
                New Rider ID
              </button>
            </div>
          </div>

          <div style={styles.rolePanel}>
            <h2 style={styles.roleTitle}>Driver</h2>
            <label style={styles.label} htmlFor="driver-id">Driver ID</label>
            <input
              id="driver-id"
              value={driverId}
              onChange={(event) => setDriverId(event.target.value)}
              style={styles.input}
            />
            <div style={styles.roleActions}>
              <button style={styles.primaryBtn} onClick={continueAsDriver}>
                Continue as Driver
              </button>
              <button style={styles.secondaryBtn} onClick={resetDriver}>
                New Driver ID
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "96px 20px 40px",
    background: "#020617",
  },
  content: {
    width: "min(880px, 100%)",
    display: "grid",
    gap: "32px",
    textAlign: "center",
  },
  kicker: {
    margin: "0 0 12px",
    color: "#67e8f9",
    fontSize: "14px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  title: {
    margin: 0,
    fontSize: "56px",
    fontWeight: "800",
    color: "#ffffff",
  },
  subtitle: {
    maxWidth: "560px",
    margin: "14px auto 0",
    fontSize: "17px",
    lineHeight: 1.7,
    color: "#94a3b8",
  },
  roles: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
  },
  rolePanel: {
    padding: "20px",
    background: "rgba(15,23,42,0.96)",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: "8px",
    textAlign: "left",
  },
  roleTitle: {
    margin: "0 0 16px",
    color: "#f8fafc",
    fontSize: "22px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "700",
  },
  input: {
    width: "100%",
    padding: "11px",
    borderRadius: "8px",
    border: "1px solid #475569",
    background: "#020617",
    color: "#e2e8f0",
    fontSize: "15px",
  },
  roleActions: {
    display: "grid",
    gap: "10px",
    marginTop: "14px",
  },
  primaryBtn: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#00a67d",
    color: "white",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "11px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "transparent",
    color: "#e2e8f0",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default Home;

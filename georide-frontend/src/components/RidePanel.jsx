import { useEffect, useState } from "react";
import { requestRide } from "../services/api";
import axios from "axios";

const RidePanel = ({ pickup, drop, setAssignedDriver }) => {
  const [ride, setRide] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("ride");

    if (saved) {
      const parsed = JSON.parse(saved);
      setRide(parsed);
      setAssignedDriver(parsed.driver);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get("http://localhost:5000/ride/current");

        if (!res.data) {
          setRide(null);
          setAssignedDriver(null);
          localStorage.removeItem("ride");
          return;
        }

        setRide(res.data);
        setAssignedDriver(res.data.driver);
        localStorage.setItem("ride", JSON.stringify(res.data));

      } catch {}
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleRequestRide = async () => {
    if (!pickup || !drop) {
      alert("Select pickup and drop");
      return;
    }

    const res = await requestRide(
      pickup.lat,
      pickup.lng,
      drop.lat,
      drop.lng
    );

    setRide(res);
    setAssignedDriver(res.driver);
    localStorage.setItem("ride", JSON.stringify(res));
  };

  return (
    <div
      style={{
        padding: "20px",
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
        borderRight: "1px solid rgba(255,255,255,0.1)",
        height: "100%",
        width: "300px",
      }}
    >
      {!ride && (
        <button
          onClick={handleRequestRide}
          style={{
            width: "100%",
            padding: "12px",
            background: "linear-gradient(135deg, #00c896, #00a67d)",
            border: "none",
            borderRadius: "10px",
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          🚕 Request Ride
        </button>
      )}

      {ride && (
        <div style={{ marginTop: "20px", lineHeight: "1.8" }}>
          <p><b>Driver:</b> {ride.driver?.id}</p>
          <p><b>Fare:</b> ₹{ride.fare}</p>
          <p><b>ETA:</b> {ride.eta} mins</p>

          <p>
            <b>Distance:</b>{" "}
            {ride.tripDistance
              ? ride.tripDistance.toFixed(2)
              : 0} km
          </p>

          {ride.status === "ASSIGNED" && (
            <p style={{ color: "#38bdf8" }}>
              <b>OTP:</b> {ride.otp}
            </p>
          )}

          <p style={{ marginTop: "10px", color: "#94a3b8" }}>
            Status: {ride.status}
          </p>
        </div>
      )}
    </div>
  );
};

export default RidePanel;
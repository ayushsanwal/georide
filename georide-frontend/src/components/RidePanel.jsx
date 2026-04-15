import { useEffect, useState } from "react";
import { requestRide } from "../services/api";
import axios from "axios";

const RidePanel = ({ pickup, drop, setAssignedDriver }) => {
  const [ride, setRide] = useState(null);

  // 🔥 Load saved ride (but don't trust blindly)
  useEffect(() => {
    const saved = localStorage.getItem("ride");

    if (saved) {
      const parsed = JSON.parse(saved);
      setRide(parsed);
      setAssignedDriver(parsed.driver);
    }
  }, []);

  // 🔥 Sync with backend (SOURCE OF TRUTH)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get("http://localhost:5000/ride/current");

        // ✅ If NO ride on backend → clear everything
        if (!res.data) {
          setRide(null);
          setAssignedDriver(null);
          localStorage.removeItem("ride");
          return;
        }

        // ✅ Sync with backend
        setRide(res.data);
        setAssignedDriver(res.data.driver);
        localStorage.setItem("ride", JSON.stringify(res.data));

      } catch (err) {
        // silent fail
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // 🚕 Request Ride
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
        background: "#020617",
        color: "white",
        height: "100%",
        width: "300px",
      }}
    >
      {/* 🚀 SHOW BUTTON ONLY IF NO ACTIVE RIDE */}
      {!ride && (
        <button
          onClick={handleRequestRide}
          style={{
            padding: "10px 15px",
            background: "#00c896",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            color: "white",
            width: "100%",
          }}
        >
          Request Ride
        </button>
      )}

      {/* 📊 SHOW RIDE DETAILS */}
      {ride && (
        <div style={{ marginTop: "20px" }}>
          <p><b>Driver ID:</b> {ride.driver?.id}</p>

          <p><b>Fare:</b> ₹{ride.fare}</p>

          <p><b>ETA:</b> {ride.eta} mins</p>

          <p>
            <b>Distance:</b>{" "}
            {ride.tripDistance
              ? ride.tripDistance.toFixed(2)
              : 0} km
          </p>

          {/* OTP only before ride starts */}
          {ride.status === "ASSIGNED" && (
            <p><b>OTP:</b> {ride.otp}</p>
          )}

          {/* Status indicator */}
          <p style={{ marginTop: "10px", color: "#94a3b8" }}>
            Status: {ride.status}
          </p>
        </div>
      )}
    </div>
  );
};

export default RidePanel;
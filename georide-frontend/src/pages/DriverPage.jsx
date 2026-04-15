import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";
import { socket } from "../services/api";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const DriverPage = () => {
  const mapRef = useRef(null);
  const driverMarker = useRef(null);
  const pickupMarker = useRef(null);

  const [ride, setRide] = useState(null);
  const [otp, setOtp] = useState("");

  const driver = useRef({
    id: "d1",
    lat: 28.6139,
    lng: 77.209,
  });

  // INIT MAP
  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: "driver-map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [driver.current.lng, driver.current.lat],
      zoom: 13,
    });

    const el = document.createElement("div");
    el.style.background = "blue";
    el.style.width = "16px";
    el.style.height = "16px";
    el.style.borderRadius = "50%";

    driverMarker.current = new mapboxgl.Marker(el)
      .setLngLat([driver.current.lng, driver.current.lat])
      .addTo(mapRef.current);
  }, []);

  // 🔥 FETCH RIDE STATE
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get("http://localhost:5000/ride/current");
        setRide(res.data);

        if (res.data?.pickup && !pickupMarker.current) {
          const el = document.createElement("div");
          el.style.background = "green";
          el.style.width = "14px";
          el.style.height = "14px";
          el.style.borderRadius = "50%";

          pickupMarker.current = new mapboxgl.Marker(el)
            .setLngLat([res.data.pickup.lng, res.data.pickup.lat])
            .addTo(mapRef.current);
        }

      } catch {}
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // 🚗 MOVE DRIVER
  useEffect(() => {
    if (!ride) return;

    const target =
      ride.status === "ASSIGNED"
        ? ride.pickup
        : ride.status === "ONGOING"
        ? ride.drop
        : null;

    if (!target) return;

    const interval = setInterval(() => {
      const newLat =
        driver.current.lat + (target.lat - driver.current.lat) * 0.05;

      const newLng =
        driver.current.lng + (target.lng - driver.current.lng) * 0.05;

      driver.current = {
        ...driver.current,
        lat: newLat,
        lng: newLng,
      };

      driverMarker.current.setLngLat([newLng, newLat]);

      socket.emit("driverLocationUpdate", {
        driverId: driver.current.id,
        lat: newLat,
        lng: newLng,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [ride]);

  // 🚀 START RIDE
  const startRide = async () => {
    try {
      await axios.post("http://localhost:5000/ride/verify-otp", { otp });
      alert("Ride Started");
    } catch {
      alert("Invalid OTP");
    }
  };

  // 🛑 END RIDE
  const endRide = async () => {
    await axios.post("http://localhost:5000/ride/end");
    alert("Ride Ended");
    setRide(null);
  };

  return (
    <div>
      <div style={{ padding: "10px", background: "#020617", color: "white" }}>
        <h3>Driver Dashboard</h3>

        {ride && (
          <>
            <p>Status: {ride.status}</p>

            {ride.status === "ASSIGNED" && (
              <>
                <input
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button onClick={startRide}>Start Ride</button>
              </>
            )}

            {ride.status === "ONGOING" && (
              <button onClick={endRide}>End Ride</button>
            )}
          </>
        )}
      </div>

      <div id="driver-map" style={{ height: "80vh" }} />
    </div>
  );
};

export default DriverPage;
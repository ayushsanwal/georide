import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";
import ngeohash from "ngeohash";
import { socket, getHotspots, getRecommendations } from "../services/api";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const DriverPage = () => {
  const mapRef = useRef(null);
  const driverMarker = useRef(null);
  const pickupMarker = useRef(null);

  const [ride, setRide] = useState(null);
  const [otp, setOtp] = useState("");

  const [hotspots, setHotspots] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const driver = useRef({
    id: "d1",
    lat: 28.6139,
    lng: 77.209,
  });

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: "driver-map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [driver.current.lng, driver.current.lat],
      zoom: 13,
    });

    const el = document.createElement("div");
    el.innerHTML = "🚕";
    el.style.fontSize = "24px";

    driverMarker.current = new mapboxgl.Marker(el)
      .setLngLat([driver.current.lng, driver.current.lat])
      .addTo(mapRef.current);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get("http://localhost:5000/ride/current");
        setRide(res.data);

        if (res.data?.pickup && !pickupMarker.current) {
          const el = document.createElement("div");
          el.innerHTML = "📍";

          pickupMarker.current = new mapboxgl.Marker(el)
            .setLngLat([res.data.pickup.lng, res.data.pickup.lat])
            .addTo(mapRef.current);
        }
      } catch {}
    }, 2000);

    return () => clearInterval(interval);
  }, []);

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

      driver.current = { ...driver.current, lat: newLat, lng: newLng };

      driverMarker.current.setLngLat([newLng, newLat]);

      socket.emit("driverLocationUpdate", {
        driverId: driver.current.id,
        lat: newLat,
        lng: newLng,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [ride]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const hot = await getHotspots();
        const rec = await getRecommendations();

        setHotspots(hot.hotspots || []);
        setRecommendations(rec.recommendations || []);
      } catch {}
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const startRide = async () => {
    try {
      await axios.post("http://localhost:5000/ride/verify-otp", { otp });
      alert("Ride Started");
    } catch {
      alert("Invalid OTP");
    }
  };

  const endRide = async () => {
    await axios.post("http://localhost:5000/ride/end");
    alert("Ride Ended");

    setRide(null);

    if (pickupMarker.current) {
      pickupMarker.current.remove();
      pickupMarker.current = null;
    }
  };

  return (
    <div style={{ marginTop: "60px", display: "flex" }}>

      {/* LEFT PANEL */}
      <div style={{
        width: "300px",
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
        borderRight: "1px solid rgba(255,255,255,0.1)",
        padding: "15px",
        color: "white"
      }}>
        <h3>🚕 Driver Dashboard</h3>

        {ride && (
          <>
            <p>Status: <b>{ride.status}</b></p>

            {ride.status === "ASSIGNED" && (
              <>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  style={{ width: "100%", marginBottom: "10px" }}
                />

                <button
                  onClick={startRide}
                  style={{
                    padding: "8px",
                    background: "#00c896",
                    border: "none",
                    borderRadius: "6px",
                    color: "white",
                    width: "100%"
                  }}
                >
                  Start Ride
                </button>
              </>
            )}

            {ride.status === "ONGOING" && (
              <button
                onClick={endRide}
                style={{
                  padding: "8px",
                  background: "#ef4444",
                  border: "none",
                  borderRadius: "6px",
                  color: "white",
                  width: "100%"
                }}
              >
                End Ride
              </button>
            )}
          </>
        )}

        <h4 style={{ marginTop: "20px" }}>🔥 Hotspots</h4>
        {hotspots.map((h, i) => (
          <p key={i}
            style={{ cursor: "pointer", color: "#38bdf8" }}
            onClick={() => {
              const { latitude, longitude } = ngeohash.decode(h.geohash);
              mapRef.current.flyTo({ center: [longitude, latitude], zoom: 14 });
            }}>
            📍 {h.geohash} → {h.demand}
          </p>
        ))}

        <h4 style={{ marginTop: "20px" }}>🤖 Recommendations</h4>
        {recommendations.map((r, i) => (
          <p key={i}
            style={{ cursor: "pointer", color: "#22c55e" }}
            onClick={() => {
              const { latitude, longitude } = ngeohash.decode(r.geohash);

              driver.current.lat = latitude;
              driver.current.lng = longitude;

              driverMarker.current.setLngLat([longitude, latitude]);

              mapRef.current.flyTo({ center: [longitude, latitude], zoom: 14 });
            }}>
            🤖 {r.geohash} → {r.availableDrivers.length} drivers
          </p>
        ))}
      </div>

      <div id="driver-map" style={{ flex: 1, height: "100vh" }} />
    </div>
  );
};

export default DriverPage;
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import {
  socket,
  getDriverId,
  getHotspots,
  getRecommendations,
  getRideForDriver,
  verifyOTPForRider,
  endRideForRider,
} from "../services/api";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const START_LOCATION = { lat: 28.6139, lng: 77.209 };

const styles = {
  shell: {
    marginTop: "60px",
    display: "flex",
    height: "calc(100vh - 60px)",
  },
  panel: {
    width: "340px",
    background: "rgba(15,23,42,0.96)",
    borderRight: "1px solid rgba(148,163,184,0.2)",
    padding: "18px",
    color: "#e2e8f0",
    overflowY: "auto",
  },
  label: {
    margin: "0 0 6px",
    fontSize: "12px",
    color: "#94a3b8",
  },
  value: {
    margin: "0 0 14px",
    fontSize: "14px",
    overflowWrap: "anywhere",
  },
  section: {
    padding: "14px 0",
    borderTop: "1px solid rgba(148,163,184,0.18)",
  },
  primary: {
    width: "100%",
    padding: "10px",
    background: "#00a67d",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontWeight: "700",
    cursor: "pointer",
  },
  danger: {
    width: "100%",
    padding: "10px",
    background: "#dc2626",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontWeight: "700",
    cursor: "pointer",
  },
  intelItem: {
    width: "100%",
    padding: "10px",
    marginBottom: "8px",
    background: "rgba(30,41,59,0.8)",
    border: "1px solid rgba(148,163,184,0.16)",
    borderRadius: "8px",
    color: "#e2e8f0",
    textAlign: "left",
    cursor: "pointer",
  },
};

const getDriverStartLocation = (driverId) => {
  const hash = [...driverId].reduce(
    (total, char) => total + char.charCodeAt(0),
    0
  );
  const latOffset = ((hash % 9) - 4) * 0.0012;
  const lngOffset = (((Math.floor(hash / 9)) % 9) - 4) * 0.0012;

  return {
    lat: START_LOCATION.lat + latOffset,
    lng: START_LOCATION.lng + lngOffset,
  };
};

const createLabelMarker = (label, color) => {
  const el = document.createElement("div");
  el.textContent = label;
  el.style.width = "26px";
  el.style.height = "26px";
  el.style.borderRadius = "50%";
  el.style.background = color;
  el.style.color = "white";
  el.style.display = "grid";
  el.style.placeItems = "center";
  el.style.fontSize = "12px";
  el.style.fontWeight = "700";
  el.style.transform = "translate(-50%, -50%)";
  el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.35)";
  return el;
};

const setLine = (mapInstance, sourceId, layerId, coordinates, color) => {
  const data = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates,
    },
  };

  if (mapInstance.getSource(sourceId)) {
    mapInstance.getSource(sourceId).setData(data);
    return;
  }

  mapInstance.addSource(sourceId, {
    type: "geojson",
    data,
  });

  mapInstance.addLayer({
    id: layerId,
    type: "line",
    source: sourceId,
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": color,
      "line-width": 4,
      "line-opacity": 0.85,
    },
  });
};

const removeLine = (mapInstance, sourceId, layerId) => {
  if (mapInstance.getLayer(layerId)) {
    mapInstance.removeLayer(layerId);
  }

  if (mapInstance.getSource(sourceId)) {
    mapInstance.removeSource(sourceId);
  }
};

const getStatusText = (ride) => {
  if (!ride) return "Available";
  if (ride.status === "ASSIGNED") return "Go to pickup";
  if (ride.status === "ONGOING") return "Ride in progress";
  return ride.status;
};

const DriverPage = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const driverMarker = useRef(null);
  const pickupMarker = useRef(null);
  const dropMarker = useRef(null);

  const driverId = useMemo(() => getDriverId(), []);
  const driver = useRef({
    id: driverId,
    ...getDriverStartLocation(driverId),
  });

  const [ride, setRide] = useState(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [hotspots, setHotspots] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const emitDriverLocation = useCallback(() => {
    socket.emit("driverLocationUpdate", {
      driverId: driver.current.id,
      lat: driver.current.lat,
      lng: driver.current.lng,
    });
  }, []);

  const updateDriverRoute = useCallback((target, color) => {
    if (!mapRef.current || !target) return;

    setLine(
      mapRef.current,
      "driver-route",
      "driver-route-line",
      [
        [driver.current.lng, driver.current.lat],
        [target.lng, target.lat],
      ],
      color
    );
  }, []);

  useEffect(() => {
    if (mapRef.current) return undefined;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [driver.current.lng, driver.current.lat],
      zoom: 13,
    });

    driverMarker.current = new mapboxgl.Marker(
      createLabelMarker("C", "#0891b2")
    )
      .setLngLat([driver.current.lng, driver.current.lat])
      .addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    emitDriverLocation();
    const interval = setInterval(emitDriverLocation, 3000);

    return () => clearInterval(interval);
  }, [emitDriverLocation]);

  useEffect(() => {
    const loadRide = async () => {
      try {
        const data = await getRideForDriver(driverId);
        setRide(data);
        setError("");
      } catch (err) {
        setError(err?.response?.data?.message || "Could not load ride");
      }
    };

    loadRide();
    const interval = setInterval(loadRide, 2000);

    return () => clearInterval(interval);
  }, [driverId]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!ride) {
      pickupMarker.current?.remove();
      pickupMarker.current = null;
      dropMarker.current?.remove();
      dropMarker.current = null;
      removeLine(mapRef.current, "driver-route", "driver-route-line");
      return;
    }

    if (ride.pickup && !pickupMarker.current) {
      pickupMarker.current = new mapboxgl.Marker(
        createLabelMarker("P", "#0284c7")
      )
        .setLngLat([ride.pickup.lng, ride.pickup.lat])
        .addTo(mapRef.current);

      mapRef.current.flyTo({
        center: [ride.pickup.lng, ride.pickup.lat],
        zoom: 14,
      });
    }

    if (ride.status === "ONGOING" && ride.drop && !dropMarker.current) {
      dropMarker.current = new mapboxgl.Marker(
        createLabelMarker("D", "#16a34a")
      )
        .setLngLat([ride.drop.lng, ride.drop.lat])
        .addTo(mapRef.current);

      mapRef.current.flyTo({
        center: [ride.drop.lng, ride.drop.lat],
        zoom: 14,
      });
    }

    if (ride.status === "ASSIGNED") {
      dropMarker.current?.remove();
      dropMarker.current = null;
      updateDriverRoute(ride.pickup, "#0284c7");
    }

    if (ride.status === "ONGOING") {
      updateDriverRoute(ride.drop, "#00a67d");
    }
  }, [ride, updateDriverRoute]);

  useEffect(() => {
    if (!ride || !driverMarker.current) return undefined;

    const target =
      ride.status === "ASSIGNED"
        ? ride.pickup
        : ride.status === "ONGOING"
        ? ride.drop
        : null;

    if (!target) return undefined;

    const interval = setInterval(() => {
      const newLat =
        driver.current.lat + (target.lat - driver.current.lat) * 0.05;
      const newLng =
        driver.current.lng + (target.lng - driver.current.lng) * 0.05;

      driver.current = { ...driver.current, lat: newLat, lng: newLng };
      driverMarker.current.setLngLat([newLng, newLat]);
      updateDriverRoute(target, ride.status === "ASSIGNED" ? "#0284c7" : "#00a67d");
      emitDriverLocation();
    }, 1000);

    return () => clearInterval(interval);
  }, [ride, emitDriverLocation, updateDriverRoute]);

  useEffect(() => {
    const loadDriverIntel = async () => {
      try {
        const hot = await getHotspots();
        const rec = await getRecommendations();

        setHotspots(hot.hotspots || []);
        setRecommendations(rec.recommendations || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Could not load driver intelligence");
      }
    };

    loadDriverIntel();
    const interval = setInterval(loadDriverIntel, 3000);

    return () => clearInterval(interval);
  }, []);

  const startRide = async () => {
    if (!ride || !otp.trim()) {
      setError("Enter the rider OTP");
      return;
    }

    try {
      const result = await verifyOTPForRider(ride.riderId, otp);
      setRide(result.ride);
      setOtp("");
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid OTP");
    }
  };

  const endRide = async () => {
    if (!ride) return;

    try {
      await endRideForRider(ride.riderId);
      setRide(null);
      setOtp("");
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not end ride");
    }
  };

  const moveToLocation = (lat, lng) => {
    driver.current = {
      ...driver.current,
      lat,
      lng,
    };

    driverMarker.current?.setLngLat([lng, lat]);
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 14 });
    emitDriverLocation();
  };

  return (
    <div style={styles.shell}>
      <aside style={styles.panel}>
        <h2 style={{ margin: "0 0 4px", fontSize: "22px" }}>
          Driver Dashboard
        </h2>
        <p style={{ ...styles.label, marginBottom: "18px" }}>
          Driver: {driverId}
        </p>

        <div style={styles.section}>
          <p style={styles.label}>Status</p>
          <p style={{ ...styles.value, fontWeight: "700", color: "#67e8f9" }}>
            {getStatusText(ride)}
          </p>

          {!ride && (
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
              Stay on this page to remain available for nearby riders.
            </p>
          )}
        </div>

        {error && (
          <p style={{ color: "#fca5a5", fontSize: "13px", margin: "12px 0" }}>
            {error}
          </p>
        )}

        {ride && (
          <div style={styles.section}>
            <p style={styles.label}>Ride ID</p>
            <p style={styles.value}>{ride.rideId}</p>

            <p style={styles.label}>Rider</p>
            <p style={styles.value}>{ride.riderId}</p>

            <p style={styles.label}>Fare</p>
            <p style={styles.value}>Rs {ride.fare}</p>

            {ride.status === "ASSIGNED" && (
              <>
                <p style={styles.label}>Pickup ETA</p>
                <p style={styles.value}>{ride.driverEtaMinutes} mins</p>

                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter rider OTP"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "8px",
                    border: "1px solid #475569",
                    background: "#020617",
                    color: "#e2e8f0",
                  }}
                />

                <button onClick={startRide} style={styles.primary}>
                  Start Ride
                </button>
              </>
            )}

            {ride.status === "ONGOING" && (
              <>
                <p style={styles.label}>Destination ETA</p>
                <p style={styles.value}>{ride.destinationEtaMinutes} mins</p>

                <button onClick={endRide} style={styles.danger}>
                  End Ride
                </button>
              </>
            )}
          </div>
        )}

        {!ride && (
          <div style={styles.section}>
            <h3 style={{ margin: "0 0 10px", fontSize: "16px" }}>
              Hotspots
            </h3>
            {hotspots.length === 0 && (
              <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                Hotspots appear after ride requests.
              </p>
            )}
            {hotspots.map((h) => (
              <button
                key={h.geohash}
                type="button"
                style={styles.intelItem}
                onClick={() => moveToLocation(h.lat, h.lng)}
              >
                <b>{h.geohash}</b>
                <br />
                Demand: {h.demand}
              </button>
            ))}

            <h3 style={{ margin: "18px 0 10px", fontSize: "16px" }}>
              Recommendations
            </h3>
            {recommendations.length === 0 && (
              <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                Recommendations appear when demand data exists.
              </p>
            )}
            {recommendations.map((r) => (
              <button
                key={r.geohash}
                type="button"
                style={styles.intelItem}
                onClick={() => moveToLocation(r.lat, r.lng)}
              >
                <b>{r.geohash}</b>
                <br />
                {r.message}: {r.availableDriversNearby} drivers nearby
              </button>
            ))}
          </div>
        )}
      </aside>

      <div ref={mapContainerRef} style={{ flex: 1, height: "100%" }} />
    </div>
  );
};

export default DriverPage;

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { socket } from "../services/api";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapView = ({ pickup, drop, assignedDriver, setPickup, setDrop }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const markersRef = useRef({});
  const pickupMarker = useRef(null);
  const dropMarker = useRef(null);

  const pickupRef = useRef(null);
  const dropRef = useRef(null);

  const center = [77.2090, 28.6139];

  // 🚀 INIT MAP
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center,
      zoom: 13,
    });

    setTimeout(() => {
      map.current.resize();
    }, 100);

    map.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;

      // 📍 PICKUP
      if (!pickupRef.current) {
        pickupRef.current = { lat, lng };
        setPickup(pickupRef.current);

        if (pickupMarker.current) pickupMarker.current.remove();

        const el = document.createElement("div");
        el.innerHTML = "📍";
        el.style.fontSize = "20px";
        el.style.transform = "translate(-50%, -50%)";

        pickupMarker.current = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .addTo(map.current);
      }

      // 🏁 DROP
      else if (!dropRef.current) {
        dropRef.current = { lat, lng };
        setDrop(dropRef.current);

        if (dropMarker.current) dropMarker.current.remove();

        const el = document.createElement("div");
        el.innerHTML = "🏁";
        el.style.fontSize = "20px";
        el.style.transform = "translate(-50%, -50%)";

        dropMarker.current = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .addTo(map.current);
      }
    });
  }, []);

  // 🚗 DRIVER UPDATES (WITH FILTERING)
  useEffect(() => {
    socket.on("driverLocationUpdate", (driver) => {
      if (!map.current) return;

      const isAssigned = assignedDriver?.id === driver.id;

      // 🔥 IF RIDE ACTIVE → REMOVE OTHER DRIVERS
      if (assignedDriver && !isAssigned) {
        if (markersRef.current[driver.id]) {
          markersRef.current[driver.id].remove();
          delete markersRef.current[driver.id];
        }
        return;
      }

      let marker = markersRef.current[driver.id];

      if (!marker) {
        const el = document.createElement("div");

        el.innerHTML = isAssigned ? "🚕" : "🚗";
        el.style.fontSize = isAssigned ? "22px" : "16px";
        el.style.transform = "translate(-50%, -50%)";

        if (isAssigned) {
          el.style.filter = "drop-shadow(0 0 6px cyan)";
        }

        marker = new mapboxgl.Marker(el)
          .setLngLat([driver.lng, driver.lat])
          .addTo(map.current);

        markersRef.current[driver.id] = marker;

      } else {
        // move
        marker.setLngLat([driver.lng, driver.lat]);

        // update UI
        const el = marker.getElement();

        el.innerHTML = isAssigned ? "🚕" : "🚗";
        el.style.fontSize = isAssigned ? "22px" : "16px";

        if (isAssigned) {
          el.style.filter = "drop-shadow(0 0 6px cyan)";
        } else {
          el.style.filter = "none";
        }
      }
    });

    return () => socket.off("driverLocationUpdate");
  }, [assignedDriver]);

  // 🔥 VERY IMPORTANT: RESTORE ALL DRIVERS AFTER RIDE ENDS
  useEffect(() => {
    if (!assignedDriver) {
      // remove all markers → they will reappear via socket
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};
    }
  }, [assignedDriver]);

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "100vh" }}
    />
  );
};

export default MapView;
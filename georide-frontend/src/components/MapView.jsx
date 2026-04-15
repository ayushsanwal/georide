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

  // 🔥 IMPORTANT: use refs for click logic
  const pickupRef = useRef(null);
  const dropRef = useRef(null);

  const center = [77.2090, 28.6139];

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

      // ✅ USE REFS (NOT STATE)
      if (!pickupRef.current) {
        pickupRef.current = { lat, lng };
        setPickup(pickupRef.current);

        if (pickupMarker.current) pickupMarker.current.remove();

        const el = document.createElement("div");
        el.style.background = "green";
        el.style.width = "14px";
        el.style.height = "14px";
        el.style.borderRadius = "50%";

        pickupMarker.current = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .addTo(map.current);

      } else if (!dropRef.current) {
        dropRef.current = { lat, lng };
        setDrop(dropRef.current);

        if (dropMarker.current) dropMarker.current.remove();

        const el = document.createElement("div");
        el.style.background = "black";
        el.style.width = "14px";
        el.style.height = "14px";
        el.style.borderRadius = "50%";

        dropMarker.current = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .addTo(map.current);
      }
    });

  }, []);

  // DRIVER UPDATES
  useEffect(() => {
    socket.on("driverLocationUpdate", (driver) => {
      if (!map.current) return;

      let marker = markersRef.current[driver.id];

      const isAssigned = assignedDriver?.id === driver.id;

      if (!marker) {
        const el = document.createElement("div");
        el.style.background = isAssigned ? "blue" : "red";
        el.style.width = "14px";
        el.style.height = "14px";
        el.style.borderRadius = "50%";

        marker = new mapboxgl.Marker(el)
          .setLngLat([driver.lng, driver.lat])
          .addTo(map.current);

        markersRef.current[driver.id] = marker;
      } else {
        marker.setLngLat([driver.lng, driver.lat]);
      }
    });

    return () => socket.off("driverLocationUpdate");
  }, [assignedDriver]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
};

export default MapView;
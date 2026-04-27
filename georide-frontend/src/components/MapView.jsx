import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { socket } from "../services/api";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const CENTER = [77.2090, 28.6139];

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

const MapView = ({
  pickup,
  drop,
  assignedDriver,
  resetSignal,
  setPickup,
  setDrop,
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const markersRef = useRef({});
  const pickupMarker = useRef(null);
  const dropMarker = useRef(null);

  const pickupRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    if (map.current) return undefined;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: CENTER,
      zoom: 13,
    });

    setTimeout(() => {
      map.current?.resize();
    }, 100);

    map.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;

      if (!pickupRef.current) {
        pickupRef.current = { lat, lng };
        setPickup(pickupRef.current);

        pickupMarker.current?.remove();
        pickupMarker.current = new mapboxgl.Marker(
          createLabelMarker("P", "#0284c7")
        )
          .setLngLat([lng, lat])
          .addTo(map.current);
      } else if (!dropRef.current) {
        dropRef.current = { lat, lng };
        setDrop(dropRef.current);

        dropMarker.current?.remove();
        dropMarker.current = new mapboxgl.Marker(
          createLabelMarker("D", "#16a34a")
        )
          .setLngLat([lng, lat])
          .addTo(map.current);
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [setDrop, setPickup]);

  useEffect(() => {
    const handleDriverLocation = (driver) => {
      if (!map.current || !driver) return;

      const isAssigned = assignedDriver?.id === driver.id;

      if (assignedDriver && !isAssigned) {
        markersRef.current[driver.id]?.remove();
        delete markersRef.current[driver.id];
        return;
      }

      let marker = markersRef.current[driver.id];

      if (!marker) {
        marker = new mapboxgl.Marker(
          createLabelMarker(isAssigned ? "T" : "C", isAssigned ? "#0891b2" : "#475569")
        )
          .setLngLat([driver.lng, driver.lat])
          .addTo(map.current);

        markersRef.current[driver.id] = marker;
      } else {
        marker.setLngLat([driver.lng, driver.lat]);
        const el = marker.getElement();
        el.textContent = isAssigned ? "T" : "C";
        el.style.background = isAssigned ? "#0891b2" : "#475569";
      }
    };

    socket.on("driverLocationUpdate", handleDriverLocation);

    return () => {
      socket.off("driverLocationUpdate", handleDriverLocation);
    };
  }, [assignedDriver]);

  useEffect(() => {
    if (assignedDriver) {
      Object.entries(markersRef.current).forEach(([driverId, marker]) => {
        if (driverId !== assignedDriver.id) {
          marker.remove();
          delete markersRef.current[driverId];
        }
      });
      return;
    }

    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};
  }, [assignedDriver]);

  useEffect(() => {
    if (!map.current || !pickup || !drop) return;

    const drawRoute = () => {
      setLine(
        map.current,
        "rider-route",
        "rider-route-line",
        [
          [pickup.lng, pickup.lat],
          [drop.lng, drop.lat],
        ],
        "#00a67d"
      );
    };

    if (map.current.loaded()) {
      drawRoute();
      return;
    }

    map.current.once("load", drawRoute);
  }, [pickup, drop]);

  useEffect(() => {
    pickupRef.current = null;
    dropRef.current = null;
    pickupMarker.current?.remove();
    pickupMarker.current = null;
    dropMarker.current?.remove();
    dropMarker.current = null;
    if (map.current) {
      removeLine(map.current, "rider-route", "rider-route-line");
    }
  }, [resetSignal]);

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default MapView;

import axios from "axios";
import { io } from "socket.io-client";

const BASE_URL = "http://localhost:5000";

// REST API
export const getNearbyDrivers = async (lat, lng) => {
  const res = await axios.get(
    `${BASE_URL}/rider/nearby-drivers?lat=${lat}&lng=${lng}`
  );
  return res.data;
};

export const requestRide = async (
  pickupLat,
  pickupLng,
  dropLat,
  dropLng
) => {
  const res = await axios.post(`${BASE_URL}/ride/request`, {
    pickupLat,
    pickupLng,
    dropLat,
    dropLng,
  });

  return res.data;
};

export const getHotspots = async () => {
  const res = await axios.get(`${BASE_URL}/admin/hotspots`);
  return res.data;
};

export const getRecommendations = async () => {
  const res = await axios.get(`${BASE_URL}/admin/recommendations`);
  return res.data;
};

export const socket = io(BASE_URL);
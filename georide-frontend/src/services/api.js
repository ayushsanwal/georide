import axios from "axios";
import { io } from "socket.io-client";

const BASE_URL = "http://localhost:5000";

export const getRiderId = () => {
  let riderId = localStorage.getItem("riderId");

  if (!riderId) {
    riderId = "r_" + Math.random().toString(36).substring(2, 8);
    localStorage.setItem("riderId", riderId);
  }

  return riderId;
};

export const getDriverId = () => {
  let driverId = localStorage.getItem("driverId");

  if (!driverId) {
    driverId = "d_" + Math.random().toString(36).substring(2, 8);
    localStorage.setItem("driverId", driverId);
  }

  return driverId;
};

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
  const riderId = getRiderId();

  const res = await axios.post(`${BASE_URL}/ride/request`, {
    riderId,
    pickupLat,
    pickupLng,
    dropLat,
    dropLng,
  });

  return res.data;
};

export const getRide = async () => {
  const riderId = getRiderId();
  const res = await axios.get(
    `${BASE_URL}/ride/current?riderId=${riderId}`
  );

  return res.data;
};

export const getRideForDriver = async (driverId) => {
  const res = await axios.get(
    `${BASE_URL}/ride/driver?driverId=${driverId}`
  );

  return res.data;
};

export const verifyOTP = async (otp) => {
  const riderId = getRiderId();
  const res = await axios.post(`${BASE_URL}/ride/verify-otp`, {
    riderId,
    otp,
  });

  return res.data;
};

export const verifyOTPForRider = async (riderId, otp) => {
  const res = await axios.post(`${BASE_URL}/ride/verify-otp`, {
    riderId,
    otp,
  });

  return res.data;
};

export const endRide = async () => {
  const riderId = getRiderId();
  const res = await axios.post(`${BASE_URL}/ride/end`, {
    riderId,
  });

  return res.data;
};

export const endRideForRider = async (riderId) => {
  const res = await axios.post(`${BASE_URL}/ride/end`, {
    riderId,
  });

  return res.data;
};

export const cancelRide = async () => {
  const riderId = getRiderId();
  const res = await axios.post(`${BASE_URL}/ride/cancel`, {
    riderId,
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

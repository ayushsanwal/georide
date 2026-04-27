const BASE_FARE = 50;
const PER_KM_RATE = 12;
const AVG_SPEED = 30; // km/h

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const calculateFare = (distance) => {
  return Math.round(BASE_FARE + distance * PER_KM_RATE);
};

const calculateETA = (distance) => {
  const hours = distance / AVG_SPEED;
  return Math.max(1, Math.ceil(hours * 60));
};

module.exports = {
  calculateDistance,
  calculateFare,
  calculateETA,
};

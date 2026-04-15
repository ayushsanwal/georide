let activeRide = null;

const createRide = (ride) => {
  activeRide = ride;
};

const getRide = () => activeRide;

const updateRide = (updates) => {
  if (!activeRide) return null;

  activeRide = {
    ...activeRide,
    ...updates,
  };

  return activeRide;
};

const clearRide = () => {
  activeRide = null;
};

module.exports = {
  createRide,
  getRide,
  updateRide,
  clearRide,
};
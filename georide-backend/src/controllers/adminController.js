const { getDemandMap } = require("../data/demandStore");
const { getHotspots } = require("../services/demandService");
const { recommendDrivers } = require("../services/recommendationService");

const getDemand = (req, res) => {
  return res.json({
    demand: getDemandMap(),
  });
};

const getHotspotsController = (req, res) => {
  const hotspots = getHotspots();

  return res.json({
    hotspots,
  });
};

// ✅ FIXED NAME (VERY IMPORTANT)
const getRecommendationsController = (req, res) => {
  const recommendations = recommendDrivers();

  return res.json({
    recommendations,
  });
};

module.exports = {
  getDemand,
  getHotspotsController,
  getRecommendationsController, // ✅ MUST MATCH app.js
};
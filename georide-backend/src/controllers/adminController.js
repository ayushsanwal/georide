const { getDemandMap } = require("../data/demandStore");
const { getHotspots } = require("../services/demandService");
const { recommendDrivers } = require("../services/recommendationService");

const getDemand = async (req, res) => {
  try {
    return res.json({
      demand: await getDemandMap(),
    });
  } catch (error) {
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: error.message,
    });
  }
};

const getHotspotsController = async (req, res) => {
  try {
    return res.json({
      hotspots: await getHotspots(),
    });
  } catch (error) {
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: error.message,
    });
  }
};

const getRecommendationsController = async (req, res) => {
  try {
    return res.json({
      recommendations: await recommendDrivers(),
    });
  } catch (error) {
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: error.message,
    });
  }
};

module.exports = {
  getDemand,
  getHotspotsController,
  getRecommendationsController,
};

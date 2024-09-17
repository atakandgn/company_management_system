const Unit = require("../models/unitModel");
const Category = require("../models/categoryModel");

const getStatics = async (req, res) => {
  try {
    const units = await Unit.find();
    const categories = await Category.find();

    res.status(200).json({ units, categories });
  } catch (error) {
    console.error("Error getting statics:", error);
    res.status(500).json({ message: "Failed to get statics." });
  }
};

module.exports = { getStatics };

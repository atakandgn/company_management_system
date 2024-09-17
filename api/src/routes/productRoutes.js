const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const { getProduct, addProduct, updateProduct, getLastAddedProducts, deleteProduct,productChartData } = require("../controllers/productController");
const {getStatics} = require("../controllers/staticsController");

const router = express.Router();

router.get("/", authenticateToken, getProduct);
router.post("/add", authenticateToken, addProduct);
router.put("/update/:id", authenticateToken, updateProduct);
router.get("/last-added", authenticateToken, getLastAddedProducts);
router.delete("/delete/:id", authenticateToken, deleteProduct);
router.get("/statics", authenticateToken, getStatics);
router.get("/chart-data", authenticateToken, productChartData);

module.exports = router;

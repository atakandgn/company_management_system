const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const { getCompanies, getLastAddedCompanies, addCompany, updateCompany ,deleteCompany, companyChartData } = require("../controllers/companyController");

const router = express.Router();

router.get("/", authenticateToken, getCompanies); 
router.post("/add", authenticateToken, addCompany);
router.put("/update/:id", authenticateToken, updateCompany);
router.get("/last-added", authenticateToken, getLastAddedCompanies);
router.delete("/delete/:id", authenticateToken, deleteCompany);
router.get("/chart-data",authenticateToken,  companyChartData);

module.exports = router;

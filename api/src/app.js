const express = require("express");
const userRoutes = require("./routes/userRoutes");
const companyRoutes = require("./routes/companyRoutes");
const productRoutes = require("./routes/productRoutes");
const app = express();
const cors = require("cors");

app.use(cors());

app.use(express.json());
app.use(express.json());

// Routes
app.use("/company", companyRoutes);
app.use("/product", productRoutes);
app.use("/user", userRoutes);

module.exports = app;

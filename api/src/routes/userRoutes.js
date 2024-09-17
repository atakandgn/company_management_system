const express = require("express");
const authenticateToken = require ("../middlewares/authenticateToken")
const { login, register, updateUser, getUserData} = require("../controllers/userController");


const router = express.Router();

router.post("/login", login);        
router.post("/register", register);  
router.put("/update", authenticateToken, updateUser);
router.get("/", authenticateToken, getUserData );

module.exports = router;

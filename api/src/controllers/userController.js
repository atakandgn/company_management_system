const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  validateEmail,
  validatePassword,
} = require("../middlewares/validators");
require("dotenv").config();

const secretKey = process.env.JWT_SECRET_KEY;

const login = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, secretKey);
    res
      .status(200)
      .json({ token, user: { ...user._doc, password: undefined } });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in", error });
  }
};

const register = async (req, res) => {
  try {
    if (!validateEmail(req.body.email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    if (!validatePassword(req.body.password)) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, and one number." });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const { username, email, firstname, lastname } = req.body;

    const newUser = new User({
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword,
    });

    const result = await newUser.save();
    res.status(201).json({ userId: result._id });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: `Error registering user.` });
  }
};

const getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error getting user data:", error);
    res.status(500).json({ message: "Error getting user data" });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.user.userId; 
    const { firstname, lastname, username, email, password } = req.body;
    if (email && !validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    if (password && !validatePassword(password)) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, and one number." });
    }

    const user = await User.findById(userId);
    let set = {
      firstname: firstname || user.firstname,
      lastname: lastname || user.lastname,
      username: username || user.username,
      email: email || user.email,
    };

    if (password) {
      set.password = await bcrypt.hash(password, 10);
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: set,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) throw new Error("User not found or update failed");

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({ message: "Failed to update user.", error });
  }
};

module.exports = {
  login,
  register,
  updateUser,
  getUserData,
};

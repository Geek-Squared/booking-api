const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

// Get all users
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      message: "Users fetched",
      users: users,
    });
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

// Create a user
router.post("/signup", async (req, res, next) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  try {
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      email: req.body.email,
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
      password: hashedPassword,
      userType: req.body.userType,
    });
    user
      .save()
      .then((result) => {
        res.status(201).json({
          message: "User stored",
          createdUser: user,
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({
          error: err,
        });
      });
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

// login
router.post("/login", async (req, res, next) => {
  console.log("Login request received");
  console.log("Request body:", req.body);
  try {
    const user = await User.findOne({ email: req.body.email });
    console.log("User found:", user);
    if (!user) {
      return res.status(401).json({ message: "Email Not found" });
    }

    const result = await bcrypt.compare(req.body.password, user.password);
    if (!result) {
      return res.status(401).json({ message: "Incorrect Password" });
    }

    // Create a JWT token
    const token = jwt.sign(
      { email: user.email, userId: user._id },
      "your_jwt_secret",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Auth successful",
      token: token,
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Get a user by ID
router.get("/:userId", async (req, res, next) => {
  try {
    const id = req.params.userId;
    const user = await User.findById(id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

// Update a user by ID
router.delete("/:userId", async (req, res, next) => {
  try {
    const id = req.params.userId;
    const result = await User.findByIdAndRemove(id);
    if (result) {
      res.status(200).json({ message: "User deleted" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

module.exports = router;

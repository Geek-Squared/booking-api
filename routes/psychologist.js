const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Psychologist = require("../models/Psychologist");
const User = require("../models/User");
const authenticateToken = require("../utils/authMiddleware");

// Get all psychologists
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const psychologists = await Psychologist.find().populate("user");
    res.status(200).json({
      message: "Psychologists fetched",
      psychologists: psychologists,
    });
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

//  Create a psychologist
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user || user.userType !== "Psychologist") {
      return res
        .status(400)
        .json({ message: "Invalid user ID or user is not a psychologist" });
    }
    const psychologist = new Psychologist({
      _id: new mongoose.Types.ObjectId(),
      user: req.body.userId,
      slots: req.body.slots,
    });
    psychologist
      .save()
      .then((result) => {
        res.status(201).json({
          message: "Psychologist stored",
          createdPsychologist: psychologist,
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

// Get a psychologist by ID
router.get("/:psychologistId", authenticateToken, async (req, res, next) => {
  try {
    const id = req.params.psychologistId;
    const psychologist = await Psychologist.findById(id).populate("user");
    if (psychologist) {
      res.status(200).json(psychologist);
    } else {
      res.status(404).json({ message: "Psychologist not found" });
    }
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

// Update a psychologist by ID
router.delete("/:psychologistId", authenticateToken, async (req, res, next) => {
  try {
    const id = req.params.psychologistId;
    const result = await Psychologist.findByIdAndRemove(id);
    if (result) {
      res.status(200).json({ message: "Psychologist deleted" });
    } else {
      res.status(404).json({ message: "Psychologist not found" });
    }
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

module.exports = router;

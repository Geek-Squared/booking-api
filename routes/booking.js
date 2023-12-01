const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Psychologist = require("../models/Psychologist");
const authenticateToken = require("../utils/authMiddleware");
const { Vonage } = require("@vonage/server-sdk");

const vonage = new Vonage({
  apiKey: "24263916",
  apiSecret: "b4Zp7s6afAwixKEp",
});

// Get all bookings
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const bookings = await Booking.find().populate("patient psychologist");
    res.status(200).json({
      message: "Bookings fetched",
      bookings: bookings,
    });
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

// Create a booking
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const patient = await User.findById(req.body.patientId);
    const psychologist = await Psychologist.findById(req.body.psychologistId);
    if (!patient || patient.userType !== "Client" || !psychologist) {
      return res
        .status(400)
        .json({
          message:
            "Invalid patient ID, psychologist ID, or patient is not a client",
        });
    }
    const booking = new Booking({
      _id: new mongoose.Types.ObjectId(),
      patient: req.body.patientId,
      slot: req.body.slot,
      psychologist: req.body.psychologistId,
    });
    booking
      .save()
      .then(async (result) => {
        // Send SMS notifications
        const text = `Booking confirmed for ${booking.slot}. Patient Name: ${patient.name}, Email: ${patient.email}`;
        const from = "Vonage APIs";
        const to = "27644756041";
        await vonage.sms
          .send({ to, from, text })
          .then((resp) => {
            console.log("Message sent successfully");
            console.log(`response ${resp}`);
          })
          .catch((err) => {
            console.log("There was an error sending the messages.");
            console.error(err);
          });

        res.status(201).json({
          message: "Booking stored",
          createdBooking: booking,
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

// Get a booking by ID
router.get("/:bookingId", authenticateToken, async (req, res, next) => {
  try {
    const id = req.params.bookingId;
    const booking = await Booking.findById(id).populate("patient psychologist");
    if (booking) {
      res.status(200).json({
        ...booking._doc,
        patientName: booking.patient.name,
        psychologistName: booking.psychologist.name,
      });
    } else {
      res.status(404).json({ message: "Booking not found" });
    }
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

// Update a booking
router.put("/:bookingId", authenticateToken, async (req, res, next) => {
  try {
    const id = req.params.bookingId;
    const newSlot = req.body.slot;
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    // If the user is a psychologist, they can only reschedule their own bookings
    if (
      req.user.userType === "Psychologist" &&
      booking.psychologist.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You can only reschedule your own bookings" });
    }
    // If the user is a client, they can only reschedule their own bookings
    if (
      req.user.userType === "Client" &&
      booking.patient.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You can only reschedule your own bookings" });
    }
    booking.slot = newSlot;
    await booking.save();
    res.status(200).json({
      message: "Booking rescheduled",
      booking: booking,
    });
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

// Delete a booking
router.delete("/:bookingId", authenticateToken, async (req, res, next) => {
  try {
    const id = req.params.bookingId;
    const result = await Booking.findByIdAndRemove(id);
    if (result) {
      res.status(200).json({ message: "Booking deleted" });
    } else {
      res.status(404).json({ message: "Booking not found" });
    }
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

module.exports = router;

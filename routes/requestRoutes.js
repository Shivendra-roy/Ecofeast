// routes/requestRoutes.js
const express = require("express");
const Request = require("../models/request");
const { auth } = require("../middleware/auth");
const router = express.Router();

// Make a request
router.post("/", auth, async (req, res) => {
    try {
        if (req.user.role !== "ngo") return res.status(403).json({ error: "Only NGOs can request food" });

        const { foodId, quantity } = req.body;
        const request = new Request({
            food: foodId,
            quantity,
            ngo: req.user._id,
            status: "Pending"
        });

        await request.save();
        res.status(201).json({ message: "Request submitted", request });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all requests (admin only)
router.get("/", auth, async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

        const requests = await Request.find().populate("food").populate("ngo", "name email");
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

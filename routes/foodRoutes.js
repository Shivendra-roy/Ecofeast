// routes/foodRoutes.js
const express = require("express");
const Food = require("../models/food");
const { auth } = require("../middleware/auth");
const router = express.Router();

// Add food (donor only)
router.post("/add", auth, async (req, res) => {
    try {
        if (req.user.role !== "donor") return res.status(403).json({ error: "Only donors can add food" });

        const { name, quantity, expiryDate, location } = req.body;
        const food = new Food({
            name,
            quantity,
            expiryDate,
            location,
            donor: req.user._id
        });

        await food.save();
        res.status(201).json({ message: "Food added successfully", food });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all available food
router.get("/", auth, async (req, res) => {
    try {
        const foods = await Food.find({ status: "available" }).populate("donor", "name email");
        res.json(foods);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark food as claimed
router.put("/:id/claim", auth, async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) return res.status(404).json({ error: "Food not found" });

        if (req.user.role !== "admin" && food.donor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Access denied" });
        }

        food.status = "claimed";
        await food.save();
        res.json({ message: "Food marked as claimed", food });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

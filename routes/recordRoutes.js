const express = require("express");
const router = express.Router();
const Record = require("../models/Record");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// GET /api/records
// viewers and above can view records
// supports filtering by type, category, date range
router.get("/", protect, async (req, res) => {
  try {
    const { type, category, startDate, endDate, page, limit } = req.query; const pageNum = parseInt(page) || 1; const limitNum = parseInt(limit) || 10; const skip = (pageNum - 1) * limitNum;
    // build filter object based on what the user sends
    let filter = { isDeleted: false };

    if (type) {
      if (!["income", "expense"].includes(type)) {
        return res.status(400).json({ message: "type must be income or expense" });
      }
      filter.type = type;
    }

    if (category) {
      filter.category = { $regex: category, $options: "i" }; // case insensitive search
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const total = await Record.countDocuments(filter); const records = await Record.find(filter) .populate("createdBy", "name email") .sort({ date: -1 }) .skip(skip) .limit(limitNum); res.json({ records, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum), }, });
  } catch (error) {
    res.status(500).json({ message: "Error fetching records", error: error.message });
  }
});

// GET /api/records/:id
// anyone logged in can view a single record
router.get("/:id", protect, async (req, res) => {
  try {
    const record = await Record.findOne({ _id: req.params.id, isDeleted: false }).populate("createdBy", "name email");


    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: "Error fetching record", error: error.message });
  }
});

// POST /api/records
// only admin and analyst can create records
router.post("/", protect, authorizeRoles("admin", "analyst"), async (req, res) => {
  const { amount, type, category, date, notes } = req.body;

  // basic validation
  if (!amount || !type || !category || !date) {
    return res.status(400).json({ message: "amount, type, category and date are all required" });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: "Amount must be greater than 0" });
  }

  if (!["income", "expense"].includes(type)) {
    return res.status(400).json({ message: "type must be either income or expense" });
  }

  try {
    const record = await Record.create({
      amount,
      type,
      category,
      date,
      notes,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Record created", record });
  } catch (error) {
    res.status(500).json({ message: "Error creating record", error: error.message });
  }
});

// PUT /api/records/:id
// only admin and analyst can update
router.put("/:id", protect, authorizeRoles("admin", "analyst"), async (req, res) => {
  const { amount, type, category, date, notes } = req.body;

  // validate if provided
  if (amount !== undefined && amount <= 0) {
    return res.status(400).json({ message: "Amount must be greater than 0" });
  }

  if (type && !["income", "expense"].includes(type)) {
    return res.status(400).json({ message: "type must be income or expense" });
  }

  try {
    const record = await Record.findByIdAndUpdate(
      req.params.id,
      { amount, type, category, date, notes },
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({ message: "Record updated", record });
  } catch (error) {
    res.status(500).json({ message: "Error updating record", error: error.message });
  }
});

// DELETE /api/records/:id
// only admin can delete records
router.delete("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try { const record = await Record.findOneAndUpdate( { _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true } ); if (!record) { return res.status(404).json({ message: "Record not found" }); } res.json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting record", error: error.message });
  }
});

module.exports = router;

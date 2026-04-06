const express = require("express");
const router = express.Router();
const Record = require("../models/Record");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { recordSchema } = require("../utils/validation");


// ==============================
// GET /api/records
// Filtering + Pagination
// ==============================
router.get("/", protect, async (req, res) => {
  try {
    const { type, category, startDate, endDate, page, limit } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    let filter = { isDeleted: false };

    // Type filter
    if (type) {
      if (!["income", "expense"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Type must be income or expense"
        });
      }
      filter.type = type;
    }

    // Category filter (case-insensitive)
    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const total = await Record.countDocuments(filter);

    const records = await Record.find(filter)
      .populate("createdBy", "name email")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: records,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching records",
      error: error.message
    });
  }
});


// ==============================
// GET /api/records/:id
// ==============================
router.get("/:id", protect, async (req, res) => {
  try {
    const record = await Record.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate("createdBy", "name email");

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found"
      });
    }

    res.json({
      success: true,
      data: record
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching record",
      error: error.message
    });
  }
});


// ==============================
// POST /api/records
// ==============================
router.post("/", protect, authorizeRoles("admin", "analyst"), async (req, res) => {
  try {
    // ✅ Joi validation
    const { error } = recordSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { amount, type, category, date, notes } = req.body;

    const record = await Record.create({
      amount,
      type,
      category,
      date,
      notes,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Record created successfully",
      data: record
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating record",
      error: error.message
    });
  }
});


// ==============================
// PUT /api/records/:id
// ==============================
router.put("/:id", protect, authorizeRoles("admin", "analyst"), async (req, res) => {
  try {
    const { amount, type } = req.body;

    // Basic validation
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0"
      });
    }

    if (type && !["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be income or expense"
      });
    }

    const record = await Record.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found"
      });
    }

    res.json({
      success: true,
      message: "Record updated successfully",
      data: record
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating record",
      error: error.message
    });
  }
});


// ==============================
// DELETE /api/records/:id (Soft delete)
// ==============================
router.delete("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const record = await Record.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found"
      });
    }

    res.json({
      success: true,
      message: "Record deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting record",
      error: error.message
    });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const Record = require("../models/Record");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// GET /api/dashboard/summary
// viewers can see this - it's read only summary data
router.get("/summary", protect, async (req, res) => {
  try {
    const records = await Record.find({ isDeleted: false });

    let totalIncome = 0;
    let totalExpenses = 0;

    records.forEach((r) => {
      if (r.type === "income") totalIncome += r.amount;
      else totalExpenses += r.amount;
    });

    const netBalance = totalIncome - totalExpenses;

    res.json({
      totalIncome,
      totalExpenses,
      netBalance,
      totalRecords: records.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating summary", error: error.message });
  }
});

// GET /api/dashboard/by-category
// breakdown of spending/income per category
// analysts and admins can access this
router.get("/by-category", protect, authorizeRoles("admin", "analyst"), async (req, res) => {
  try {
   const result = await Record.aggregate([
  { $match: { isDeleted: false } },
  {
    $group: {
      _id: { category: "$category", type: "$type" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching category data", error: error.message });
  }
});

// GET /api/dashboard/monthly-trends
// shows income vs expense month by month
// analysts and admins only
router.get("/monthly-trends", protect, authorizeRoles("admin", "analyst"), async (req, res) => {
  try {
    const result = await Record.aggregate([
  { $match: { isDeleted: false } },
  {
    $group: {
      _id: {
        year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching trends", error: error.message });
  }
});

// GET /api/dashboard/recent
// last 5 transactions - good for dashboard widget
router.get("/recent", protect, async (req, res) => {
  try {
    const recent = await Record.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("createdBy", "name");

    res.json(recent);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recent activity", error: error.message });
  }
});

module.exports = router;

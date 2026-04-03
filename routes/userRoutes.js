const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// GET /api/users
// only admin can see all users
router.get("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

// GET /api/users/me
// any logged in user can see their own profile
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

// PUT /api/users/:id/role
// admin can change role of any user
router.put("/:id/role", protect, authorizeRoles("admin"), async (req, res) => {
  const { role } = req.body;

  const validRoles = ["viewer", "analyst", "admin"];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role. Must be viewer, analyst or admin" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Role updated", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating role", error: error.message });
  }
});

// PUT /api/users/:id/status
// admin can activate or deactivate users
router.put("/:id/status", protect, authorizeRoles("admin"), async (req, res) => {
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({ message: "isActive must be true or false" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error: error.message });
  }
});

module.exports = router;

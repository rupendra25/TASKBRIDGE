const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject
} = require("../controllers/projectController");

// Create Project
router.post("/", verifyToken, createProject);

// Get All Projects
router.get("/", verifyToken, getAllProjects);

// Get Project By ID
router.get("/:id", verifyToken, getProjectById);

// Update Project
router.put("/:id", verifyToken, updateProject);

// Delete Project
router.delete("/:id", verifyToken, deleteProject);

module.exports = router;

const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    createTask,
    getTasks,
    updateTaskStatus,
    deleteTask
} = require("../controllers/taskController");

router.post(
    "/",
    verifyToken,
    createTask
);

router.get(
    "/:projectId",
    verifyToken,
    getTasks
);

router.put(
    "/:id",
    verifyToken,
    updateTaskStatus
);

router.delete(
    "/:id",
    verifyToken,
    deleteTask
);

module.exports = router; 
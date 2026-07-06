require("dotenv").config();

const express = require("express");
const cors = require("cors");
const projectRoutes = require("./routes/projectRoutes");
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const memberRoutes = require("./routes/memberRoutes");
const verifyToken = require("./middleware/authMiddleware");
const taskRoutes = require("./routes/taskRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const activityRoutes = require("./routes/activityRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
  })
);
app.use(express.json());

// Home Route
app.get("/", (req, res) => {
  res.send("TaskBridge Backend Running");
});

// Authentication Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard",dashboardRoutes);
app.use("/api/activity",activityRoutes);


// Protected Route
app.get("/api/profile", verifyToken, (req, res) => {
  res.status(200).json({
    message: "Welcome to TaskBridge!",
    user: req.user
  });
});

// Port
const PORT = process.env.PORT || 5000;

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {

    cors: {
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST"],
        credentials: true
    }

});

app.set("io", io);

io.on("connection", (socket) => {

    console.log("User Connected:", socket.id);

    socket.on("disconnect", () => {

        console.log("User Disconnected");

    });

});

server.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});



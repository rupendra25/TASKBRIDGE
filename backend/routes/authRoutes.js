const express = require("express");
const router = express.Router();

const {
  register,
  login
} = require("../controllers/authController");

router.get("/test", (req, res) => {
  res.json({
    message: "Auth Route Working"
  });
});

router.post("/register", register);
router.post("/login", login);

module.exports = router;

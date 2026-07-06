const jwt = require("jsonwebtoken");
const db = require("../config/db");
const bcrypt = require("bcrypt");

// REGISTER USER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check empty fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // Check email already exists
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, result) => {
        if (err) {
          return res.status(500).json({
            message: err.message
          });
        }

        if (result.length > 0) {
          return res.status(400).json({
            message: "Email already exists"
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        db.query(
          "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
          [name, email, hashedPassword],
          (err, result) => {
            if (err) {
              return res.status(500).json({
                message: err.message
              });
            }

            return res.status(201).json({
              message: "User Registered Successfully"
            });
          }
        );
      }
    );
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// LOGIN USER
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check empty fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and Password are required"
      });
    }

    // Find user
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, result) => {
        if (err) {
          return res.status(500).json({
            message: err.message
          });
        }

        if (result.length === 0) {
          return res.status(404).json({
            message: "User not found"
          });
        }

        const user = result[0];

        // Compare password
        const isMatch = await bcrypt.compare(
          password,
          user.password
        );

        if (!isMatch) {
          return res.status(401).json({
            message: "Invalid Password"
          });
        }

        // Generate JWT Token
        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            role: user.role
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1d"
          }
        );

        return res.status(200).json({
          message: "Login Successful",
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  register,
  login
};

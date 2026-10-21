
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// REGISTER API
async function registerUser(req, res) {
  try {
    const { username, email, password } = req.body;
    const role = "user";

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email and password are required",
      });
    }

    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hash,
      role,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.cookie("token", token);

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({
      message: "Registration failed",
    });
  }
}

// LOGIN API
async function loginUser(req, res) {
  try {
    const { username, email, password } = req.body;

    if ((!username && !email) || !password) {
      return res.status(400).json({
        message: "Email or username and password are required",
      });
    }

    const user = await userModel.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(username ? [{ username }] : []),
      ],
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.cookie("token", token);

    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "Login failed",
    });
  }
}

// GET CURRENT LOGGED-IN USER
async function getCurrentUser(req, res) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Please log in first",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch current role from MongoDB
    const user = await userModel
      .findById(decoded.id)
      .select("username email role");

    if (!user) {
      return res.status(401).json({
        message: "User account not found",
      });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Current user error:", error.message);
    return res.status(401).json({
      message: "Invalid or expired login session",
    });
  }
}

// LOGOUT API
async function logoutUser(req, res) {
  res.clearCookie("token");

  return res.status(200).json({
    message: "User logged out successfully",
  });
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
};

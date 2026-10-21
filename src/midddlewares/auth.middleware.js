
const jwt = require("jsonwebtoken");

// ARTIST MIDDLEWARE
async function authArtist(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized. Please log in.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "artist") {
      return res.status(403).json({
        message: "Only artists have access to this feature.",
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Artist auth error:", err.message);
    return res.status(401).json({
      message: "Unauthorized. Please log in again.",
    });
  }
}

// USER + ADMIN MIDDLEWARE
// Both can listen to songs; upload remains protected by authAdmin.
async function authUser(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized. Please log in.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!["user", "admin"].includes(decoded.role)) {
      return res.status(403).json({
        message: "You don't have access to this feature.",
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("User auth error:", err.message);
    return res.status(401).json({
      message: "Unauthorized. Please log in again.",
    });
  }
}

module.exports = { authArtist, authUser };

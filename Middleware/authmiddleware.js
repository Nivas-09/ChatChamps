const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Extract Bearer token

    if (!token) {
        return res.status(401).json({ success: false, message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        req.user = decoded; // Attach user info to request object
        next(); // Move to the next middleware
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid token" });
    }
};

module.exports = authMiddleware;

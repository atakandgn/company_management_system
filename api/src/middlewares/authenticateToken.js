const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json('Authentication failed. Token not provided or invalid.');
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET_KEY);
        req.user = decoded;  // Store the decoded token payload in req.user
        next();
    } catch (error) {
        console.error('Authentication Error:', error);
        return res.status(401).json('Authentication failed. Invalid token.');
    }
};

module.exports = authenticateToken;
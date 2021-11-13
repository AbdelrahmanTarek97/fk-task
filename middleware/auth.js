const jwt = require("jsonwebtoken");
User = require("../models/user");

// Import database json file
const config = require("../config/config.json");


const verifyToken = async (req, res, next) => {
    const token =
        req.body.token || req.query.token || req.headers["x-access-token"];

    if (!token) {
        return res.status(401).send({ message: "A token is required for authentication" });
    }
    try {
        const decoded = jwt.verify(token, config.tokenPK);
        let user = await User.findOne({ username: decoded.username });
        if (!user)
            throw Error("User not found!");
        req.user = user;
    } catch (err) {
        return res.status(401).send({ message: "Invalid Token" });
    }
    return next();
};

module.exports = verifyToken;
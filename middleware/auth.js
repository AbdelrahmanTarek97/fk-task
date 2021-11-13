const jwt = require("jsonwebtoken");
User = require("../models/user");

// Import database json file
const config = require("../config/config.json");


const verifyToken = (role) => {
    // if no role is specified, return an auth middleware function that does not cosider role
    if (!role) {
        return async (req, res, next) => {
            const token =
                req.body.token || req.query.token || req.headers["x-access-token"];

            if (!token) {
                return res.status(401).send({ message: "A token is required for authentication" });
            }
            try {
                const decoded = jwt.verify(token, config.tokenPK);
                let user = await User.findOne({ username: decoded.username });
                if (!user)
                    throw Error("Invalid access info!");
                req.user = user;
            } catch (err) {
                return res.status(401).send({ message: "Invalid access info!" });
            }
            return next();
        };
    }

    // If a role is specified, then return an auth middleware function that also checks the role
    return async (req, res, next) => {
        const token =
            req.body.token || req.query.token || req.headers["x-access-token"];

        if (!token) {
            return res.status(401).send({ message: "A token is required for authentication" });
        }
        try {
            const decoded = jwt.verify(token, config.tokenPK);
            let user = await User.findOne({ username: decoded.username, role });
            if (!user)
                throw Error("Invalid access info!");
            req.user = user;
        } catch (err) {
            return res.status(401).send({ message: "Invalid access info!" });
        }
        return next();
    };

}

module.exports = verifyToken;
const jwt = require('jsonwebtoken');
const refreshToken = require('./refreshToken');
require('dotenv').config();

const getUser = (req, res, next) => {
    if (req.cookies?.accessToken) {
        try {
            // Check if access token is present in header or cookies
            const accessToken = req.cookies.accessToken;
            if (!accessToken) {
                return req.user = { error: "no access token" }
            }

            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            req.user = decoded;
            return next();

        } catch (err) {
            // Refreh the ACCESS Token using REFREH Token
            refreshToken(req, res, next, getUser);
        }
    } else {
        return res.status(401).send({ data: 'Cookie is not recieved', error: true });
    }
}

module.exports = getUser;
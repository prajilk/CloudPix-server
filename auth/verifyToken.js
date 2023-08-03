const jwt = require('jsonwebtoken');
const refreshToken = require('./refreshToken');
require('dotenv').config();


const verifyToken = (req, res, next) => {

    if(req.cookies?.accessToken){

        // Check if access token is present in header or cookies
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            return res.status(401).send({ data: 'Access token is missing', error: true });
        }

        // Verify access token
        try {
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

            // Do something with the user ID (e.g., fetch user data from database)

            return res.status(200).json({ data: req.cookies.data, user: decoded, error: false }); // Return protected data
        } catch (err) {
            // Refreh the ACCESS Token using REFREH Token
            return refreshToken(req, res, next, verifyToken)
        }

    } else {
        return res.status(401).send({ data: 'Cookie is not recieved', error: true });
    }
}

module.exports = verifyToken;
const jwt = require('jsonwebtoken');
require('dotenv').config();
const userHelper = require('../helper/usersHelper');

const createTokens = (req, res) => {

    userHelper.login(req.body).then((validUser) => {
        // Remove the password from the validUser
        const user = Object.assign({}, validUser);
        delete user._doc.password;
        delete user._doc.email;

        // Generate access token (expires in 10 minutes)
        const accessToken = jwt.sign(user._doc, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

        // Generate refresh token (expires in 7 days)
        const refreshToken = jwt.sign(user._doc, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '15d' });

        // Set refresh token in cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 1296000000 // 15 Days
        });

        // Set access token in cookie
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 1296000000 // 15 Days
        });

        return res.status(200).json({ error: false })
    }).catch((errMessage) => {
        return res.status(401).json({ message: errMessage, error: true })
    })
}

module.exports = createTokens;

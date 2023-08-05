const jwt = require('jsonwebtoken');

const updateToken = (req, res, type, value) => {

    if (req.cookies?.accessToken) {

        // Check if access token is present in header or cookies
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            return res.status(401).send({ data: 'Access token is missing', error: true });
        }

        try {

            const decodedAccPayload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            const user = { ...decodedAccPayload };
            delete user.iat;
            delete user.exp;

            const decodedRefPayload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

            // Update the payload with a new value
            user[type] = value;

            // Get the original expiration time from access token
            const originalExpTimeAcc = decodedAccPayload.exp;
            // Get the original expiration time from refresh token
            const originalExpTimeRef = decodedRefPayload.exp;

            // Create a new JWT with the updated payload and original expiration time
            const updatedToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: originalExpTimeAcc - Math.floor(Date.now() / 1000) });

            const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: originalExpTimeRef - Math.floor(Date.now() / 1000) });

            // Update the cookie with the new Data
            res.cookie('accessToken', updatedToken, {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                maxAge: 1296000000 // 15 Days
            });

            // Update the cookie with the new Data
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                maxAge: 1296000000 // 15 Days
            });

            return res.status(200).json({ message: 'Token updated successfully.', user: user });
        } catch (error) {
            console.log(error);
            return res.status(403).json({ message: 'Token validation failed.' });
        }

    } else {
        return res.status(401).json({ data: "Cookie doesn't have REFRESH Token", error: true });
    }
}

module.exports = updateToken;
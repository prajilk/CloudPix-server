const express = require("express");
const cors = require("cors")
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// Configure multer and cloudinary for handling file uploads
const { upload } = require("./config/cloudinary.config");

const app = express();

// AUthentication
const createTokens = require("./auth/createTokens");
const verifyToken = require("./auth/verifyToken");
const getUserDetails = require("./auth/getUserDetails");

// Connect to mongodb
require("./db/dbConnection")();

// Manage user collection in db
const userHelper = require("./helper/userHelper");
// Manage uploads collection in db
const uploadsHelper = require("./helper/uploadsHelper");

// const app = express();

app.use(cookieParser());
// Middleware for parsing request bodies (POST requests) as JSON objects
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// CORS is a security mechanism in browsers to control cross-origin requests.
app.use(cors({
    origin: ['http://localhost:5173', 'https://cloudpix.vercel.app'],
    credentials: true
}))

// Route for Registration
app.post("/register", (req, res) => {
    const userData = req.body;
    userHelper.register(userData).then(() => {
        res.status(200).json({ status: 'Success', error: false })
    }).catch(errMessage => {
        res.status(409).json({ status: 'Failed', message: errMessage, error: true })
    })
});

// Login route
app.post('/login', async (req, res) => { createTokens(req, res); })

// Verify user
app.get('/user/verify', verifyToken)

// LogOut user
app.get('/logout', (req, res) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        expires: new Date(0)
    })
    res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        expires: new Date(0)
    })
    res.status(200).json({ data: 'Logout out successfully' });
});

app.post("/create-collection", getUserDetails, (req, res) => {
    const collection = req.body.collectionName;
    res.send(collection)
})

// Route to handle file uploads
app.post('/upload', getUserDetails, upload.array('file'), async (req, res) => {

    const uploads = [];
    const files = req.files;
    for (const file of files) {
        const { path, size, originalname, filename } = file;
        const newPath = {
            filename: originalname,
            url: path,
            size: size,
            date: filename.slice(-10)
        }
        uploads.push(newPath);
    }
    await uploadsHelper.uploadImage(req.user._id, uploads);

    res.status(200).json({ message: "Upload successfully", urls: uploads });

});

app.get("/get-images", getUserDetails, (req, res) => {
    uploadsHelper.getUploads(req.user._id).then((images) => {
        res.status(200).json({ images: images.images })
    }).catch((err) => {
        res.status(500).json({ images: [], error: err })
    })
})

app.listen(5000, () => {
    console.log("Server listening on port 5000");
})




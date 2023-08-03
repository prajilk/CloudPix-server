const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const model = require("../db/dbModel");

const userModel = model.Users();

module.exports = {
    register: (userData) => {
        return new Promise(async (resolve, reject) => {
            const isEmailTaken = await userModel.exists({ email: userData.email })
            if (isEmailTaken) {
                reject('User already exists, Try to login!')
            } else {
                userData._id = new mongoose.Types.ObjectId()
                userData.password = await bcrypt.hash(userData.password, 10);
                await new userModel(userData).save();
                resolve();
            }
        })
    },
    login: (userData) => {
        return new Promise(async (resolve, reject) => {
            const validUser = await userModel.findOne({ email: userData.email })
            if (validUser) {
                try {
                    if (await bcrypt.compare(userData.password, validUser.password)) {
                        resolve(validUser);
                    } else {
                        reject('Incorrect password, Please try again!');
                    }
                } catch (err) { console.log("Failed to compare password and hash.") }
            } else {
                reject('Invalid email, Please try again!');
            }
        })
    },
    getUser: (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const validUser = await userModel.findOne({ _id: id })
                // Remove the password & api_key from the validUser
                if (validUser) {
                    const user = Object.assign({}, validUser);
                    delete user._doc.password;
                    resolve(user._doc)
                } else {
                    reject({ message: 'User not found', status_code: 404 })
                }
            } catch (error) {
                reject(error)
            }
        })
    },
}
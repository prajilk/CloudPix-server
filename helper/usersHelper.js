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
    updateProfile: (id, value, type) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await userModel.updateOne({ _id: id }, { [type]: value })
                if (result.matchedCount === 0)
                    reject({ message: 'User not found', status_code: 404 })
                else
                    resolve()
            } catch (error) {
                reject(error)
            }
        })
    },
    changePassword: (passwords, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await userModel.findById(userId);
                if (!user) {
                    return reject({ message: 'User not found', status_code: 404 })
                }

                const passwordMatch = await bcrypt.compare(passwords.oldPassword, user.password)
                if (!passwordMatch) {
                    return reject({ message: 'Incorrect password', status_code: 401 })
                }
                if (passwords.oldPassword === passwords.newPassword) {
                    return reject({ message: 'New password should be different from old password', status_code: 400 })
                }

                user.password = await bcrypt.hash(passwords.newPassword, 10);
                await user.save();
                resolve({ message: 'Password changed successfully', status_code: 200 })
            } catch (error) {
                reject({ message: error, status_code: 500 })
            }
        })
    }
}
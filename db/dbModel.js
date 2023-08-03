const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Users;
module.exports = {
    Users: () => {
        const userSchema = Schema({
            fullName: String,
            email: String,
            password: String
        }, { collection: 'users', versionKey: false })
        if (!mongoose.models.Users) {
            Users = mongoose.model('Users', userSchema);
            return Users;
        } else {
            return Users;
        }
    },
    Uploads: () => {
        const uploadsSchema = Schema({
            user: mongoose.Schema.Types.ObjectId,
            images: [{
                filename: String,
                url: String,
                size: Number,
                date: Date,
                collectionName: {
                    type: String,
                    default: null
                }
            }],
            collections: String
        }, { collection: 'uploads', versionKey: false })
        if (!mongoose.models.Uploads) {
            Uploads = mongoose.model('Uploads', uploadsSchema);
            return Uploads;
        } else {
            return Uploads;
        }
    }
}
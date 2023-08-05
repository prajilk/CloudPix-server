const { default: mongoose } = require("mongoose")

const getImageObjectQuery = (userId, imageId) => {
    return [
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        {
            $project: {
                "image": {
                    $arrayElemAt: [
                        {
                            $filter: {
                                input: "$images",
                                as: "image",
                                cond: {
                                    $eq: ["$$image._id", new mongoose.Types.ObjectId(imageId)]
                                }
                            }
                        }, 0
                    ]
                }
            }
        }
    ]
}

module.exports = { getImageObjectQuery }
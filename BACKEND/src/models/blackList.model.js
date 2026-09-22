const mongoose = require("mongoose");

const blacklistSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: [true, "Token is required to blacklist"],
            unique: true,
            index: true,
            trim: true
        },

        expiresAt: {
            type: Date,
            required: [true, "Token expiry time is required"]
        }
    },
    {
        timestamps: true
    }
);

// Delete document automatically when expiresAt is reached
blacklistSchema.index(
    { expiresAt: 1 },
    {
        expireAfterSeconds: 0
    }
);

const blacklistModel = mongoose.model(
    "Blacklist",
    blacklistSchema
);

module.exports = blacklistModel;
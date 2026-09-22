const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        fromAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "account",
            required: [true, "transaction must have a from account"],
            index: true,
        },

        toAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "account",
            required: [true, "transaction must have a to account"],
            index: true,
        },

        status: {
            type: String,
            enum: {
                values: ["pending", "success", "failed", "reversed"],
                message:
                    "status must be either pending, success, failed or reversed",
            },
            default: "pending",
        },

        amount: {
            type: Number,
            required: [true, "transaction must have an amount"],
            min: [1, "transaction amount must be greater than 0"],
        },

        idempotencyKey: {
            type: String,
            required: [true, "transaction must have an idempotency key"],
            index: true,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

const transactionModel = mongoose.model(
    "transaction",
    transactionSchema
);

module.exports = transactionModel;
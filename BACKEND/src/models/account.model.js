const mongoose = require("mongoose");
const ledgerModel = require("./ledger.model");

const accountSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: [true, "Account must be associated with a user"],
            index: true
        },

        status: {
            type: String,
            enum: {
                values: ["active", "frozen", "closed"],
                message:
                    "Status must be either 'active', 'frozen', or 'closed'"
            },
            default: "active"
        },

        currency: {
            type: String,
            required: [true, "Currency is required"],
            default: "INR"
        }
    },
    {
        timestamps: true
    }
);


// One account per user for each status
accountSchema.index(
    { user: 1, status: 1 },
    { unique: true }
);


// Get account balance
accountSchema.methods.getBalance = async function () {

    const balanceData = await ledgerModel.aggregate([
        {
            $match: {
                account: this._id
            }
        },

        {
            $group: {
                _id: null,

                totalDebit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "debit"] },
                            "$amount",
                            0
                        ]
                    }
                },

                totalCredit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "credit"] },
                            "$amount",
                            0
                        ]
                    }
                }
            }
        },

        {
            $project: {
                _id: 0,

                balance: {
                    $subtract: [
                        "$totalCredit",
                        "$totalDebit"
                    ]
                }
            }
        }
    ]);


    // No ledger entries means balance = 0
    if (balanceData.length === 0) {
        return 0;
    }


    return balanceData[0].balance;
};


// Create model
const accountModel = mongoose.model(
    "account",
    accountSchema
);

module.exports = accountModel;
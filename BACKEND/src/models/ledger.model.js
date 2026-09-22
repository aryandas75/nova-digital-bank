const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Account is required"],
        index: true,
        immutable: true
    },

    amount: {
        type: Number,
        required: [true, "Ledger must have an amount"],
        
        min: [0, "Amount cannot be negative"],
        immutable: true
    },

    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "transaction",
        required: [true, "Ledger must have a transaction"],
        index: true,
        immutable: true
    },

    type: {
        type: String,
        enum: {
            values: ["credit", "debit"],
            message: "Type must be either credit or debit"
        },
        required: [true, "Ledger must have a type"],
        immutable: true
    }
});


// Prevent modification of ledger entries
function preventLedgerModification(next) {
    throw new Error("Ledger entries cannot be modified or deleted");
}

ledgerSchema.pre(
    "findOneAndUpdate",
    preventLedgerModification
);

ledgerSchema.pre(
    "updateOne",
    preventLedgerModification
);

ledgerSchema.pre(
    "updateMany",
    preventLedgerModification
);

ledgerSchema.pre(
    "update",
    preventLedgerModification
);

ledgerSchema.pre(
    "deleteMany",
    preventLedgerModification
);


// Create model
const ledgerModel = mongoose.model("ledger", ledgerSchema);

module.exports = ledgerModel;
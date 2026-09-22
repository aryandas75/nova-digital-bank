const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");


// ======================================================
// CREATE NORMAL USER TRANSACTION
// ======================================================

async function createTransaction(req, res) {
    let session;

    try {
        const {
            fromAccount,
            toAccount,
            amount,
            idempotencyKey
        } = req.body;


        // ==================================================
        // 1. REQUIRED FIELDS
        // ==================================================

        if (
            !fromAccount ||
            !toAccount ||
            !amount ||
            !idempotencyKey
        ) {
            return res.status(400).json({
                message:
                    "fromAccount, toAccount, amount and idempotencyKey are required"
            });
        }


        // ==================================================
        // 2. VALIDATE AMOUNT
        // ==================================================

        const transactionAmount = Number(amount);

        if (
            !Number.isFinite(transactionAmount) ||
            transactionAmount <= 0
        ) {
            return res.status(400).json({
                message: "Amount must be greater than 0"
            });
        }


        const MAX_TRANSACTION_AMOUNT = 1000000;

        if (
            transactionAmount >
            MAX_TRANSACTION_AMOUNT
        ) {
            return res.status(400).json({
                message:
                    "Maximum transaction amount is ₹10,00,000"
            });
        }


        // ==================================================
        // 3. VALIDATE OBJECT IDS
        // ==================================================

        if (
            !mongoose.Types.ObjectId.isValid(fromAccount) ||
            !mongoose.Types.ObjectId.isValid(toAccount)
        ) {
            return res.status(400).json({
                message:
                    "Invalid fromAccount or toAccount ID"
            });
        }


        // ==================================================
        // 4. CHECK SENDER ACCOUNT OWNERSHIP
        // ==================================================

        const fromUserAccount =
            await accountModel.findOne({
                _id: fromAccount,
                user: req.user._id
            });

        if (!fromUserAccount) {
            return res.status(403).json({
                message:
                    "You are not authorized to use this sender account"
            });
        }


        // ==================================================
        // 5. FIND RECEIVER ACCOUNT
        // ==================================================

        const toUserAccount =
            await accountModel.findOne({
                _id: toAccount
            });

        if (!toUserAccount) {
            return res.status(404).json({
                message:
                    "Receiver account not found"
            });
        }


        // ==================================================
        // 6. SELF TRANSFER CHECK
        // ==================================================

        if (
            fromUserAccount._id.equals(
                toUserAccount._id
            )
        ) {
            return res.status(400).json({
                message:
                    "You cannot transfer money to your own account"
            });
        }


        // ==================================================
        // 7. ACCOUNT STATUS
        // ==================================================

        if (
            fromUserAccount.status !== "active" ||
            toUserAccount.status !== "active"
        ) {
            return res.status(400).json({
                message:
                    "Both accounts must be active to perform a transaction"
            });
        }


        // ==================================================
        // 8. IDEMPOTENCY CHECK
        // ==================================================

        const existingTransaction =
            await transactionModel.findOne({
                idempotencyKey
            });

        if (existingTransaction) {

            if (
                existingTransaction.status ===
                "success"
            ) {
                return res.status(409).json({
                    message:
                        "Transaction with this idempotency key already exists and was successful",
                    transaction:
                        existingTransaction
                });
            }


            if (
                existingTransaction.status ===
                "pending"
            ) {
                return res.status(200).json({
                    message:
                        "Transaction with this idempotency key is still pending",
                    transaction:
                        existingTransaction
                });
            }


            if (
                existingTransaction.status ===
                "failed"
            ) {
                return res.status(409).json({
                    message:
                        "Transaction with this idempotency key already exists and failed",
                    transaction:
                        existingTransaction
                });
            }


            if (
                existingTransaction.status ===
                "reversed"
            ) {
                return res.status(409).json({
                    message:
                        "Transaction with this idempotency key already exists and was reversed",
                    transaction:
                        existingTransaction
                });
            }
        }


        // ==================================================
        // 9. START MONGODB TRANSACTION
        // ==================================================

        session = await mongoose.startSession();

        session.startTransaction();


        try {

            // ==================================================
            // 10. RE-CHECK ACCOUNTS INSIDE TRANSACTION
            // ==================================================

            const senderAccount =
                await accountModel.findOne({
                    _id: fromUserAccount._id,
                    user: req.user._id,
                    status: "active"
                }).session(session);

            if (!senderAccount) {
                throw new Error(
                    "Sender account is no longer available"
                );
            }


            const receiverAccount =
                await accountModel.findOne({
                    _id: toUserAccount._id,
                    status: "active"
                }).session(session);

            if (!receiverAccount) {
                throw new Error(
                    "Receiver account is no longer available"
                );
            }


            // ==================================================
            // 11. CHECK BALANCE INSIDE TRANSACTION
            // ==================================================

            const balanceData =
                await ledgerModel.aggregate([
                    {
                        $match: {
                            account:
                                senderAccount._id
                        }
                    },
                    {
                        $group: {
                            _id: null,

                            totalDebit: {
                                $sum: {
                                    $cond: [
                                        {
                                            $eq: [
                                                "$type",
                                                "debit"
                                            ]
                                        },
                                        "$amount",
                                        0
                                    ]
                                }
                            },

                            totalCredit: {
                                $sum: {
                                    $cond: [
                                        {
                                            $eq: [
                                                "$type",
                                                "credit"
                                            ]
                                        },
                                        "$amount",
                                        0
                                    ]
                                }
                            }
                        }
                    }
                ]).session(session);


            let balance = 0;

            if (balanceData.length > 0) {

                balance =
                    balanceData[0].totalCredit -
                    balanceData[0].totalDebit;
            }


            // ==================================================
            // 12. INSUFFICIENT BALANCE
            // ==================================================

            if (
                balance <
                transactionAmount
            ) {

                await session.abortTransaction();

                return res.status(400).json({
                    message:
                        "Insufficient balance in the fromAccount",

                    requested:
                        transactionAmount,

                    available:
                        balance
                });
            }


            // ==================================================
            // 13. CREATE PENDING TRANSACTION
            // ==================================================

            const transaction =
                await transactionModel.create(
                    [
                        {
                            fromAccount:
                                senderAccount._id,

                            toAccount:
                                receiverAccount._id,

                            amount:
                                transactionAmount,

                            idempotencyKey,

                            status:
                                "pending"
                        }
                    ],
                    {
                        session
                    }
                );


            const createdTransaction =
                transaction[0];


            // ==================================================
            // 14. DEBIT SENDER
            // ==================================================

            await ledgerModel.create(
                [
                    {
                        account:
                            senderAccount._id,

                        amount:
                            transactionAmount,

                        transaction:
                            createdTransaction._id,

                        type:
                            "debit"
                    }
                ],
                {
                    session
                }
            );


            // ==================================================
            // 15. CREDIT RECEIVER
            // ==================================================

            await ledgerModel.create(
                [
                    {
                        account:
                            receiverAccount._id,

                        amount:
                            transactionAmount,

                        transaction:
                            createdTransaction._id,

                        type:
                            "credit"
                    }
                ],
                {
                    session
                }
            );


            // ==================================================
            // 16. MARK SUCCESS
            // ==================================================

            createdTransaction.status =
                "success";

            await createdTransaction.save({
                session
            });


            // ==================================================
            // 17. COMMIT TRANSACTION
            // ==================================================

            await session.commitTransaction();


            // ==================================================
            // 18. EMAIL AFTER SUCCESSFUL COMMIT
            // ==================================================

            try {

                if (req.user) {

                    await emailService.sendTransactionEmail(
                        req.user.email,
                        req.user.name,
                        transactionAmount,
                        receiverAccount._id
                    );
                }

            } catch (emailError) {

                // Email failure should NOT
                // reverse the successful transaction.

                console.error(
                    "Transaction email failed:",
                    emailError.message
                );
            }


            // ==================================================
            // 19. RESPONSE
            // ==================================================

            return res.status(201).json({
                message:
                    "Transaction completed successfully",

                transaction:
                    createdTransaction
            });


        } catch (error) {

            // ==================================================
            // ROLLBACK
            // ==================================================

            if (
                session.inTransaction()
            ) {
                await session.abortTransaction();
            }


            console.error(
                "Transaction Error:",
                error
            );


            // ==================================================
            // IDEMPOTENCY RACE CONDITION
            // ==================================================

            if (
                error.code === 11000
            ) {

                const existingTransaction =
                    await transactionModel.findOne({
                        idempotencyKey
                    });

                if (existingTransaction) {

                    if (
                        existingTransaction.status ===
                        "success"
                    ) {
                        return res.status(409).json({
                            message:
                                "Transaction with this idempotency key already exists and was successful",

                            transaction:
                                existingTransaction
                        });
                    }


                    if (
                        existingTransaction.status ===
                        "pending"
                    ) {
                        return res.status(200).json({
                            message:
                                "Transaction with this idempotency key is still pending",

                            transaction:
                                existingTransaction
                        });
                    }


                    return res.status(409).json({
                        message:
                            "Transaction with this idempotency key already exists",

                        transaction:
                            existingTransaction
                    });
                }
            }


            return res.status(500).json({
                message:
                    "Transaction failed. Please try again later."
            });
        }

    } catch (error) {

        console.error(
            "Create Transaction Error:",
            error
        );

        return res.status(500).json({
            message:
                "Internal server error. Please try again later."
        });

    } finally {

        // ==================================================
        // ALWAYS END SESSION
        // ==================================================

        if (session) {
            await session.endSession();
        }
    }
}



// ======================================================
// CREATE INITIAL FUNDS TRANSACTION
// ======================================================

async function createInitialFundsTransaction(
    req,
    res
) {
    let session;

    try {

        const {
            toAccount,
            amount,
            idempotencyKey
        } = req.body;


        // ==================================================
        // 1. REQUIRED FIELDS
        // ==================================================

        if (
            !toAccount ||
            !amount ||
            !idempotencyKey
        ) {
            return res.status(400).json({
                message:
                    "toAccount, amount and idempotencyKey are required"
            });
        }


        // ==================================================
        // 2. AMOUNT VALIDATION
        // ==================================================

        const transactionAmount =
            Number(amount);

        if (
            !Number.isFinite(
                transactionAmount
            ) ||
            transactionAmount <= 0
        ) {
            return res.status(400).json({
                message:
                    "Amount must be greater than 0"
            });
        }


        const MAX_TRANSACTION_AMOUNT =
            1000000;

        if (
            transactionAmount >
            MAX_TRANSACTION_AMOUNT
        ) {
            return res.status(400).json({
                message:
                    "Maximum initial funds amount is ₹10,00,000"
            });
        }


        // ==================================================
        // 3. OBJECT ID VALIDATION
        // ==================================================

        if (
            !mongoose.Types.ObjectId.isValid(
                toAccount
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid toAccount ID"
            });
        }


        // ==================================================
        // 4. IDEMPOTENCY
        // ==================================================

        const existingTransaction =
            await transactionModel.findOne({
                idempotencyKey
            });

        if (existingTransaction) {
            return res.status(409).json({
                message:
                    "Transaction with this idempotency key already exists",

                transaction:
                    existingTransaction
            });
        }


        // ==================================================
        // 5. RECEIVER ACCOUNT
        // ==================================================

        const toUserAccount =
            await accountModel.findOne({
                _id: toAccount
            });

        if (!toUserAccount) {
            return res.status(404).json({
                message:
                    "Receiver account not found"
            });
        }


        // ==================================================
        // 6. RECEIVER STATUS
        // ==================================================

        if (
            toUserAccount.status !==
            "active"
        ) {
            return res.status(400).json({
                message:
                    "Receiver account is not active"
            });
        }


        // ==================================================
        // 7. SYSTEM ACCOUNT
        // ==================================================

        const fromUserAccount =
            await accountModel.findOne({
                user:
                    process.env.SYSTEM_USER_ID,

                status:
                    "active"
            });

        if (!fromUserAccount) {
            return res.status(404).json({
                message:
                    "System account not found"
            });
        }


        // ==================================================
        // 8. SAME ACCOUNT CHECK
        // ==================================================

        if (
            fromUserAccount._id.equals(
                toUserAccount._id
            )
        ) {
            return res.status(400).json({
                message:
                    "System account and receiver account cannot be the same"
            });
        }


        // ==================================================
        // 9. START TRANSACTION
        // ==================================================

        session =
            await mongoose.startSession();

        session.startTransaction();


        try {

            // ==================================================
            // 10. CREATE TRANSACTION
            // ==================================================

            const transaction =
                await transactionModel.create(
                    [
                        {
                            fromAccount:
                                fromUserAccount._id,

                            toAccount:
                                toUserAccount._id,

                            amount:
                                transactionAmount,

                            idempotencyKey,

                            status:
                                "pending"
                        }
                    ],
                    {
                        session
                    }
                );


            const createdTransaction =
                transaction[0];


            // ==================================================
            // 11. DEBIT SYSTEM ACCOUNT
            // ==================================================

            await ledgerModel.create(
                [
                    {
                        account:
                            fromUserAccount._id,

                        amount:
                            transactionAmount,

                        transaction:
                            createdTransaction._id,

                        type:
                            "debit"
                    }
                ],
                {
                    session
                }
            );


            // ==================================================
            // 12. CREDIT USER ACCOUNT
            // ==================================================

            await ledgerModel.create(
                [
                    {
                        account:
                            toUserAccount._id,

                        amount:
                            transactionAmount,

                        transaction:
                            createdTransaction._id,

                        type:
                            "credit"
                    }
                ],
                {
                    session
                }
            );


            // ==================================================
            // 13. MARK SUCCESS
            // ==================================================

            createdTransaction.status =
                "success";

            await createdTransaction.save({
                session
            });


            // ==================================================
            // 14. COMMIT
            // ==================================================

            await session.commitTransaction();


            return res.status(201).json({
                message:
                    "Initial funds transaction completed",

                transaction:
                    createdTransaction
            });


        } catch (error) {

            if (
                session.inTransaction()
            ) {
                await session.abortTransaction();
            }


            console.error(
                "Initial funds transaction error:",
                error
            );


            // ==================================================
            // IDEMPOTENCY RACE
            // ==================================================

            if (
                error.code === 11000
            ) {

                const existingTransaction =
                    await transactionModel.findOne({
                        idempotencyKey
                    });

                if (existingTransaction) {
                    return res.status(409).json({
                        message:
                            "Transaction with this idempotency key already exists",

                        transaction:
                            existingTransaction
                    });
                }
            }


            return res.status(500).json({
                message:
                    "Initial funds transaction failed. Please try again later."
            });

        }

    } catch (error) {

        console.error(
            "Create initial funds error:",
            error
        );

        return res.status(500).json({
            message:
                "Internal server error. Please try again later."
        });

    } finally {

        if (session) {
            await session.endSession();
        }
    }
}



// ======================================================
// GET USER TRANSACTIONS
// ======================================================

async function getUserTransactions(
    req,
    res
) {
    try {

        // ==================================================
        // 1. PAGINATION
        // ==================================================

        const page =
            Math.max(
                Number(req.query.page) || 1,
                1
            );


        const limit =
            Math.min(
                Math.max(
                    Number(req.query.limit) || 10,
                    1
                ),
                50
            );


        const skip =
            (page - 1) * limit;


        // ==================================================
        // 2. FIND USER ACCOUNT
        // ==================================================

        const userAccount =
            await accountModel.findOne({
                user:
                    req.user._id,

                status:
                    "active"
            });

        if (!userAccount) {
            return res.status(404).json({
                message:
                    "Active account not found"
            });
        }


        // ==================================================
        // 3. TRANSACTION FILTER
        // ==================================================

        const filter = {
            $or: [
                {
                    fromAccount:
                        userAccount._id
                },
                {
                    toAccount:
                        userAccount._id
                }
            ]
        };


        // ==================================================
        // 4. TOTAL COUNT
        // ==================================================

        const totalTransactions =
            await transactionModel.countDocuments(
                filter
            );


        // ==================================================
        // 5. FETCH TRANSACTIONS
        // ==================================================

        const transactions =
            await transactionModel
                .find(filter)

                .populate({
                    path:
                        "fromAccount",

                    select:
                        "user status currency",

                    populate: {
                        path:
                            "user",

                        select:
                            "name email"
                    }
                })

                .populate({
                    path:
                        "toAccount",

                    select:
                        "user status currency",

                    populate: {
                        path:
                            "user",

                        select:
                            "name email"
                    }
                })

                .sort({
                    createdAt:
                        -1
                })

                .skip(skip)

                .limit(limit);


        // ==================================================
        // 6. PAGINATION DATA
        // ==================================================

        const totalPages =
            Math.ceil(
                totalTransactions /
                limit
            );


        // ==================================================
        // 7. RESPONSE
        // ==================================================

        return res.status(200).json({
            transactions,

            pagination: {
                currentPage:
                    page,

                limit,

                totalTransactions,

                totalPages,

                hasNextPage:
                    page < totalPages,

                hasPreviousPage:
                    page > 1
            }
        });

    } catch (error) {

        console.error(
            "Get transactions error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to fetch transactions. Please try again later."
        });
    }
}



// ======================================================
// EXPORT
// ======================================================

module.exports = {
    createTransaction,
    createInitialFundsTransaction,
    getUserTransactions
};
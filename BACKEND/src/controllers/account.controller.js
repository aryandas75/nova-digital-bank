const accountModel = require("../models/account.model");
const userModel = require("../models/user.model");

async function createAccount(req, res) {
    try {
        const existingAccount = await accountModel.findOne({
            user: req.user._id,
            status: "active"
        });

        if (existingAccount) {
            return res.status(409).json({
                message: "You already have an active bank account",
                account: existingAccount
            });
        }

        const account = await accountModel.create({
            user: req.user._id,
            status: "active"
        });

        return res.status(201).json({
            message: "Bank account created successfully",
            account
        });

    } catch (error) {
        console.error("Create account error:", error);

        // Handle MongoDB duplicate-key race condition
        if (error.code === 11000) {
            const existingAccount = await accountModel.findOne({
                user: req.user._id,
                status: "active"
            });

            return res.status(409).json({
                message: "You already have an active bank account",
                account: existingAccount
            });
        }

        return res.status(500).json({
            message: "Unable to create account",
            error: error.message
        });
    }
}
 
async function getUserAccountController(req,res){
    const account = await accountModel.find({user : req.user._id});
    res.status(200).json({
        account
    })
}
async function getAccountBalanceController(req,res){
    const { accountId} = req.params;
    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id
    })
    if(!account){
        return res.status(400).json({
            message : "Account not found"
        })
    }
    const balance = await account.getBalance();
    res.status(200).json ({
        accountId : account._id,
        balance : balance
    })
}

async function findAccountByEmail(req, res) {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const user = await userModel.findOne({
            email: email.toLowerCase().trim()
        }).select("_id name email");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const account = await accountModel.findOne({
            user: user._id,
            status: "active"
        }).select("_id user status currency");

        if (!account) {
            return res.status(404).json({
                message: "Active account not found for this user"
            });
        }

        // Don't allow searching yourself
        if (String(user._id) === String(req.user._id)) {
            return res.status(400).json({
                message: "You cannot transfer money to yourself"
            });
        }

        return res.status(200).json({
            account: {
                _id: account._id,
                name: user.name,
                email: user.email,
                currency: account.currency
            }
        });

    } catch (error) {
        console.error("Find account error:", error);

        return res.status(500).json({
            message: "Unable to find receiver",
            error: error.message
        });
    }
}

module.exports = { createAccount ,getUserAccountController, getAccountBalanceController,findAccountByEmail };
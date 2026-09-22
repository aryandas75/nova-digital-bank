const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service');
const BlackListModel = require("../models/blackList.model")

async function userRegister(req, res) {

    const { name, email, password } = req.body;

    const isExist = await userModel.findOne({
        email: email
    });

    if (isExist) {
        return res.status(422).json({
            message: "user already exist",
            status: "false"
        });
    }

    const user = await userModel.create({
        name,
        email,
        password
    });

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
        process.env.NODE_ENV === "production"
            ? "none"
            : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000
});

    res.status(201).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token: token
    });

    await emailService.sendRegister(user.email, user.name);
}


async function userLogin(req, res) {

    try {

        const { email, password } = req.body;

        const user = await userModel
            .findOne({ email })
            .select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.cookie("token", token, {
    httpOnly: true,

    secure:
        process.env.NODE_ENV === "production",

    sameSite:
        process.env.NODE_ENV === "production"
            ? "none"
            : "lax",

    maxAge:
        30 * 24 * 60 * 60 * 1000
});

        return res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token: token
        });

    } catch (error) {

        console.error("Login Error:", error);

        return res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
}

async function userLogout(req, res) {

    try {

        // Get token from cookie or Authorization header
        const token =
            req.cookies.token ||
            req.headers.authorization?.split(" ")[1];

        // No token
        if (!token) {
            return res.status(200).json({
                message: "User already logged out"
            });
        }

        // Decode token to get expiry time
        const decoded = jwt.decode(token);

        if (!decoded || !decoded.exp) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        // JWT exp is in seconds
        // JavaScript Date uses milliseconds
        const expiresAt = new Date(decoded.exp * 1000);

        // Add token to blacklist
        await BlackListModel.create({
            token: token,
            expiresAt: expiresAt
        });

        // Clear cookie
        res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
        process.env.NODE_ENV === "production"
            ? "none"
            : "lax"
});

        return res.status(200).json({
            message: "User logged out successfully"
        });

    } catch (error) {

        console.error("Logout error:", error);

        return res.status(500).json({
            message: "Logout failed",
            error: error.message
        });
    }
}

async function getProfile(req, res) {
    try {
        const user = await userModel
            .findById(req.user._id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            user
        });

    } catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            message: "Unable to get profile",
            error: error.message
        });
    }
}
async function changePassword(req, res) {
    try {
        const {
            currentPassword,
            newPassword
        } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message:
                    "Current password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message:
                    "New password must be at least 6 characters"
            });
        }

        const user = await userModel
            .findById(req.user._id)
            .select("+password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch =
            await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                message:
                    "Current password is incorrect"
            });
        }

        user.password = newPassword;

        // This invalidates JWTs created before
        // the password was changed.
        user.passwordChangedAt = new Date();

        await user.save();

        // Remove current browser session
        res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
        process.env.NODE_ENV === "production"
            ? "none"
            : "lax"
});

        return res.status(200).json({
            message:
                "Password changed successfully. Please login again."
        });

    } catch (error) {
        console.error(
            "Change password error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to change password",
            error: error.message
        });
    }
}

module.exports = {userRegister, userLogin , userLogout ,getProfile ,changePassword};
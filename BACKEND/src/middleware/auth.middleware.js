const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const BlacklistModel = require("../models/blackList.model");


// ======================================================
// NORMAL USER AUTHENTICATION
// ======================================================

async function authMiddleware(req, res, next) {
    try {

        // 1. Get token from cookie OR Authorization header
        const token =
            req.cookies.token ||
            req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Authentication token is missing"
            });
        }


        // 2. Check whether token was blacklisted
        const isBlacklisted =
            await BlacklistModel.findOne({ token });

        if (isBlacklisted) {
            return res.status(401).json({
                message: "Unauthorised access, token is invalid"
            });
        }


        // 3. Verify JWT
        let decoded;

        try {
            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );
        } catch (error) {

            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    message: "Token has expired. Please login again."
                });
            }

            if (error.name === "JsonWebTokenError") {
                return res.status(401).json({
                    message: "Invalid authentication token"
                });
            }

            return res.status(401).json({
                message: "Authentication failed"
            });
        }


        // 4. Check user ID inside token
        if (!decoded.userId) {
            return res.status(401).json({
                message: "Invalid authentication token"
            });
        }


        // 5. Find user
        const user =
            await userModel.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                message: "User associated with this token no longer exists"
            });
        }


        // 6. Check whether password was changed
        //
        // If password was changed after this JWT was issued,
        // this old JWT should no longer be accepted.

        if (
            user.passwordChangedAt &&
            decoded.iat * 1000 <
            new Date(user.passwordChangedAt).getTime()
        ) {
            return res.status(401).json({
                message:
                    "Session expired because your password was changed. Please login again."
            });
        }


        // 7. Attach user to request
        req.user = user;


        // 8. Continue
        return next();

    } catch (error) {

        console.error(
            "Authentication middleware error:",
            error
        );

        return res.status(500).json({
            message: "Authentication service error"
        });
    }
}



// ======================================================
// SYSTEM USER AUTHENTICATION
// ======================================================

async function authSystemUserMiddleware(
    req,
    res,
    next
) {
    try {

        // 1. Get token
        const token =
            req.cookies.token ||
            req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Authentication token is missing"
            });
        }


        // 2. Check blacklist
        const isBlacklisted =
            await BlacklistModel.findOne({ token });

        if (isBlacklisted) {
            return res.status(401).json({
                message: "Unauthorised access, token is invalid"
            });
        }


        // 3. Verify JWT
        let decoded;

        try {
            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );
        } catch (error) {

            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    message: "Token has expired. Please login again."
                });
            }

            return res.status(401).json({
                message: "Invalid authentication token"
            });
        }


        // 4. Make sure token contains user ID
        if (!decoded.userId) {
            return res.status(401).json({
                message: "Invalid authentication token"
            });
        }


        // 5. Find user
        const user =
            await userModel.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                message: "System user not found"
            });
        }


        // 6. Make sure this is the configured system user
        if (
            String(user._id) !==
            String(process.env.SYSTEM_USER_ID)
        ) {
            return res.status(403).json({
                message: "System user access required"
            });
        }


        // 7. Password change invalidation
        if (
            user.passwordChangedAt &&
            decoded.iat * 1000 <
            new Date(user.passwordChangedAt).getTime()
        ) {
            return res.status(401).json({
                message:
                    "System user session expired. Please login again."
            });
        }


        // 8. Attach user
        req.user = user;


        // 9. Continue
        return next();

    } catch (error) {

        console.error(
            "System authentication error:",
            error
        );

        return res.status(500).json({
            message: "Authentication service error"
        });
    }
}



module.exports = {
    authMiddleware,
    authSystemUserMiddleware
};
const express = require("express");

const authController =
    require("../controllers/auth.controller");

const authMiddleware =
    require("../middleware/auth.middleware");

const router = express.Router();


// Public routes

router.post(
    "/register",
    authController.userRegister
);

router.post(
    "/login",
    authController.userLogin
);


// Protected routes

router.get(
    "/profile",
    authMiddleware.authMiddleware,
    authController.getProfile
);

router.put(
    "/change-password",
    authMiddleware.authMiddleware,
    authController.changePassword
);

router.post(
    "/logout",
    authMiddleware.authMiddleware,
    authController.userLogout
);

module.exports = router;
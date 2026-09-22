const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes");

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: "https://nova-digital-bank-frontend.onrender.com",
    credentials: true,
}));

app.use("/api/auth", authRouter);
app.use("/api/account", accountRouter);
app.use("/api/transactions", transactionRoutes);

module.exports = app;
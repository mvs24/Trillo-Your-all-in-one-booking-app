const express = require("express");
const bodyParser = require("body-parser");

const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

app.use(bodyParser.json());

app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) =>
  next(new AppError("This route is not yet defined", 404))
);

app.use(globalErrorHandler);

module.exports = app;

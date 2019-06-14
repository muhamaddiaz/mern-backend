const path = require("path");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

const userRoute = require("./routes/userRoute");

app.use(cors());
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/users", userRoute);

app.use((error, req, res, next) => {
  if (!error.statusCode) {
    error.statusCode = 500;
  }
  console.log(error);
  return res.status(error.statusCode).json({
    message: "Error message",
    payload: {
      error
    }
  });
});

const PORT = process.env.PORT || 8000;

mongoose
  .connect("mongodb://localhost:27017/mydatabase", { useNewUrlParser: true })
  .then(() => {
    console.log("Database berhasil terkoneksi!");
    app.listen(PORT, () => {
      console.log(
        `[${new Date().toLocaleTimeString()}] server berjalan pada port ${PORT}`
      );
    });
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    throw err;
  });

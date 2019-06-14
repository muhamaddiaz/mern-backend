const _ = require("lodash");
const { validationResult } = require("express-validator/check");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.index = async (req, res, next) => {
  try {
    const users = await User.find({});
    if (_.isEmpty(users)) {
      throw throwError("Tidak ada users yang terdaftar", 404);
    }
    return res.status(200).json({
      message: "Seluruh data user berhasil didapatkan!",
      payload: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const errval = validationResult(req);
    if (!errval.isEmpty()) {
      throw throwError("Request tidak dapat di proses", 422, errval.array());
    }
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    await user.save();
    if (!user) {
      throw throwError("User gagal dibuat!", 422);
    }
    const token = jwt.sign(
      {
        name: user.name,
        email: user.email
      },
      "supersuperhardpasskey",
      {
        expiresIn: "1h"
      }
    );
    return res.status(200).json({
      message: "User berhasil dibuat",
      payload: {
        name: user.name,
        email: user.email,
        token: token
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (_.isEmpty(user)) {
      throw throwError("User tidak ditemukan!", 404);
    }
    const status = await User.deleteOne({ _id: user._id });
    if (!status.ok) {
      throw throwError("Operasi hapus user gagal", 422);
    }
    return res.status(200).json({
      message: "User berhasil dihapus!",
      payload: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errVal = validationResult(req);
    if (!errVal.isEmpty()) {
      throw throwError("Request tidak dapat diproses!", 422, errVal.array());
    }
    const { email, password } = req.body;
    const user = await User.find({ email }).findOne();
    if (!user) {
      throw throwError("User tidak ditemukan!", 404);
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw throwError("Password tidak cocok!", 404);
    }
    const token = makeToken({
      name: user.name,
      email: user.email
    });
    res.status(200).json({
      message: "Login berhasil!",
      payload: {
        name: user.name,
        email: user.email,
        token: token
      }
    });
  } catch (error) {
    next(error);
  }
};

function throwError(message, statusCode, optional = []) {
  const err = new Error(message);
  err.errorMessage = message;
  err.statusCode = statusCode || 500;
  if (!_.isEmpty(optional)) {
    err.errorDetail = optional;
  }
  return err;
}

function makeToken(data) {
  return jwt.sign(data, "supersuperhardkeypass");
}

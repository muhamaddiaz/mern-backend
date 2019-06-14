const express = require("express");
const { body } = require("express-validator/check");

const router = express.Router();

const auth = require("../middlewares/isAuth");

const userController = require("../controllers/userController");

router.get("/", auth, userController.index);

router.post(
  "/",
  [
    body("name")
      .isString()
      .isLength({ min: 5, max: 15 }),
    body("email").isEmail(),
    body("password")
      .isString()
      .isLength({ min: 5 })
  ],
  userController.create
);

router.delete("/:id", userController.destroy);

router.post(
  "/auth/login",
  [body("email").isString(), body("password").isString()],
  userController.login
);

module.exports = router;

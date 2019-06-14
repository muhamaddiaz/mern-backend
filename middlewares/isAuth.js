const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      const message = "authorization tidak dispesifikasikan!";
      const err = new Error(message);
      err.errorMessage = message;
      err.statusCode = 401;
      throw err;
    }
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, "supersuperhardpasskey");
    if (!verify) {
      const message = "Token tidak valid!";
      const err = new Error(message);
      err.errorMessage = message;
      err.statusCode = 401;
      throw err;
    }
    next();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

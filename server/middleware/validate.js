const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

function validate(req, _res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return next(
    new AppError(
      errors.array()[0].msg,
      400,
      "VALIDATION_ERROR",
      errors.array()
    )
  );
}

module.exports = validate;

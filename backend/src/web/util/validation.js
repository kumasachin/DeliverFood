function validation(schema) {
  return function (req, res, next) {
    const validation = schema.validate(req.body, {
      abortEarly: false,
    });
    if (validation.error) {
      res.status(400).json(validation.error);
    } else {
      req.validatedBody = validation.value;
      next();
    }
  };
}

module.exports = validation;

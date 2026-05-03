const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    // Passes the ZodError to our global error handler
    return next(error);
  }
};

module.exports = validate;

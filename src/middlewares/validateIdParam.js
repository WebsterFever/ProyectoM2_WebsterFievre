function validateIdParam(paramName) {
  return function (req, res, next) {
    const value = req.params[paramName];
    if (!/^\d+$/.test(value)) {
      return res.status(400).json({ error: `${paramName} must be a positive integer` });
    }
    next();
  };
}

module.exports = validateIdParam;

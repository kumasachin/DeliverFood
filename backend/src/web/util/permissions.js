const checkPermissions = function (permissions, models) {
  return async function (req, res, next) {
    if (!Array.isArray(permissions) || permissions.length === 0) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const userRole = req.userRole;
    if (!permissions.includes(userRole)) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const user = await models.users().get(req.userUuid);
    const userStatus = user.status;
    if (userStatus !== "active") {
      return res.status(403).json({
        message: "Access denied: User is not active",
      });
    }

    return next();
  };
};

module.exports = checkPermissions;

const ModelsRegistry = require("../../model/models");

function tokenFromHeader(headerValue) {
  const chunks = headerValue.split(" ", 2);
  if (chunks.length !== 2) {
    return {
      isValid: false,
      errorMessage: 'Token must be in format: "Bearer TOKEN_VALUE"',
    };
  }
  const [tokenType, tokenValue] = chunks;
  if (tokenType !== "Bearer") {
    return {
      isValid: false,
      errorMessage: 'Token must be of type Bearer, eg: "Bearer TOKEN_VALUE"',
    };
  }
  return {
    isValid: true,
    tokenValue,
  };
}

/**
 * @param {ModelsRegistry} models
 */
function authentication(models) {
  return function (req, res, next) {
    if (!req.headers.authorization) {
      res.status(401).json({
        error:
          "Authentication required. Please provide the token in Authorization header.",
      });
      return;
    }
    const tokenResult = tokenFromHeader(req.headers.authorization);
    if (!tokenResult.isValid) {
      res.status(400).json({ error: tokenResult.errorMessage });
      return;
    }
    const verificationResult = models
      .authTokens()
      .verifyAndDecode(tokenResult.tokenValue);
    if (verificationResult.success) {
      req.userUuid = verificationResult.payload.userUuid;
      req.userRole = verificationResult.payload.userRole;
      next();
    } else {
      res.status(403).json({ error: "Token is invalid" });
    }
  };
}

module.exports = authentication;

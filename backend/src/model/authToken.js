const jwt = require("jsonwebtoken");

class AuthToken {
  constructor(signingSecret) {
    if (!signingSecret) {
      throw new Error("Signing secret must be provided");
    }
    this._signingSecret = signingSecret;
  }

  generate({ userUuid, userRole, issuedAt }) {
    const payload = { uuid: userUuid, role: userRole };

    if (issuedAt) {
      payload.iat = issuedAt;
    }
    const token = jwt.sign(payload, this._signingSecret, {
      expiresIn: "24h",
    });

    return token;
  }

  verifyAndDecode(token) {
    try {
      const payload = jwt.verify(token, this._signingSecret);
      return {
        success: true,
        errorMessage: "",
        payload: { userUuid: payload.uuid, userRole: payload.role },
      };
    } catch (e) {
      if (e.name === "JsonWebTokenError") {
        return { success: false, errorMessage: e.message, payload: null };
      } else if (e.name === "TokenExpiredError") {
        return { success: false, errorMessage: e.message, payload: null };
      }
      throw e;
    }
  }
}

module.exports = AuthToken;

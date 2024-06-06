const AuthToken = require("./authToken");

describe("AuthToken", () => {
  test("token generation and verification", () => {
    const authToken = new AuthToken("somesecret");

    const payload = { userUuid: "12345" };
    const token = authToken.generate(payload);
    expect(authToken.verifyAndDecode(token)).toEqual({
      success: true,
      errorMessage: "",
      payload: payload,
    });
  });

  test("failing to verify due to wrong token", () => {
    const authToken = new AuthToken("somesecret");

    expect(authToken.verifyAndDecode("invalidtoken")).toEqual({
      success: false,
      errorMessage: "jwt malformed",
      payload: null,
    });
  });

  test("failing to verify due to secret mismatch", () => {
    const authToken = new AuthToken("somesecret");

    const payload = { userUuid: "12345" };
    const token = authToken.generate(payload);

    const anotherSecretToken = new AuthToken("anothersecret");
    expect(anotherSecretToken.verifyAndDecode(token)).toEqual({
      success: false,
      errorMessage: "invalid signature",
      payload: null,
    });
  });

  test("token expiration in 24h", () => {
    const authToken = new AuthToken("somesecret");

    const issued23hAgo = Math.floor(Date.now() / 1000) - 60 * 60 * 23;
    const issued24hAgo = Math.floor(Date.now() / 1000) - 60 * 60 * 24;
    const payload = { userUuid: "12345" };

    const validToken = authToken.generate({
      ...payload,
      issuedAt: issued23hAgo,
    });
    expect(authToken.verifyAndDecode(validToken)).toEqual({
      success: true,
      errorMessage: "",
      payload: payload,
    });

    const expiredToken = authToken.generate({
      ...payload,
      issuedAt: issued24hAgo,
    });
    expect(authToken.verifyAndDecode(expiredToken)).toEqual({
      success: false,
      errorMessage: "jwt expired",
      payload: null,
    });
  });
});

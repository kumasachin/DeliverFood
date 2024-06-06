const getPaginationParams = require("./getPaginationParams");

function stubReq({ query }) {
  return {
    query,
  };
}

describe("getPaginationParams", () => {
  test("blank page value", () => {
    expect(getPaginationParams(stubReq({ query: {} }))).toStrictEqual({
      isValid: true,
      pageNo: 0,
      limit: 20,
    });
    expect(getPaginationParams(stubReq({ query: { page: "" } }))).toStrictEqual(
      {
        isValid: true,
        pageNo: 0,
        limit: 20,
      }
    );
  });

  test("negative page value", () => {
    expect(
      getPaginationParams(stubReq({ query: { page: "-5" } }))
    ).toStrictEqual({
      isValid: false,
      error: "page query parameter must be a positive integer",
    });
  });

  test("invalid page value", () => {
    expect(
      getPaginationParams(stubReq({ query: { page: "abc" } }))
    ).toStrictEqual({
      isValid: false,
      error: "page query parameter has invalid value",
    });
  });

  test("valid page value", () => {
    expect(
      getPaginationParams(stubReq({ query: { page: "15" } }))
    ).toStrictEqual({
      isValid: true,
      pageNo: 15,
      limit: 20,
    });
  });
});

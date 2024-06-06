module.exports = function getPaginationParams(req) {
  let inputPage = req.query.page;
  if (!inputPage) {
    inputPage = "0";
  }
  let parsedPageNo = parseInt(inputPage);
  let error = null;
  if (parseInt(inputPage.toString()) !== parseInt(inputPage)) {
    error = "page query parameter has invalid value";
  } else if (parsedPageNo < 0) {
    error = "page query parameter must be a positive integer";
  }

  if (error) {
    return {
      isValid: false,
      error: error,
    };
  } else {
    return {
      isValid: true,
      pageNo: parsedPageNo,
      limit: 20,
    };
  }
};

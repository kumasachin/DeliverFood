function restaurantSampleData(override) {
  const defaultSampleData = {
    title: "Restaurant title",
    description: "The best restaurant",
    cuisine: "chinese",
    created_at: new Date(),
  };
  return { ...defaultSampleData, ...override };
}

function userSampleData(override) {
  const defaultSampleData = {
    email: `testuser+${Math.round(Math.random() * 10000)}@toptal.com`,
    created_at: new Date(),
  };
  return { ...defaultSampleData, ...override };
}

module.exports = {
  restaurantSampleData,
  userSampleData,
};

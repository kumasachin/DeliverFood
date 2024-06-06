const ALL_ACCESS = ["admin", "owner", "customer"];
const MODERATORS = ["admin", "owner"];
const CONTENT = ["admin", "customer"];
const ORDER_STATUSES = [
  "placed",
  "processing",
  "in route",
  "delivered",
  "cancelled",
  "received",
];

const ALLOWED_STATUSES = {
  admin: ORDER_STATUSES,
  owner: ["placed", "processing", "in route", "delivered", "cancelled"],
  customer: ["received", "cancelled"],
};

const SECTIONS = ["breakfast", "lunch", "dinner", "appetizers", "dessert"];

const CUISINES = [
  "italian",
  "french",
  "chinese",
  "japanese",
  "indian",
  "mexican",
  "greek",
];

module.exports = {
  ALL_ACCESS,
  MODERATORS,
  CONTENT,
  ORDER_STATUSES,
  ALLOWED_STATUSES,
  SECTIONS,
  CUISINES,
};

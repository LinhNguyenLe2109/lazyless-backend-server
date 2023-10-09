const dbHelper = require("./dbHelper");

module.exports.dbHelper = async function () {
  dbHelper.test();
};

module.exports.env = async function () {
  console.log("MONGO_CONNECTION: " + process.env.MONGO_CONNECTION);
  console.log("PORT: " + process.env.PORT);
  console.log("LOG_LEVEL: " + process.env.LOG_LEVEL);
};

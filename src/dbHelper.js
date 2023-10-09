const mongoose = require("mongoose");

const mongoDBConnectionString = process.env.MONGO_CONNECTION_TEST;

module.exports.connect = async function () {
  const db = await mongoose.connect(mongoDBConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  db.connection.on("error", console.error.bind(console, "Connection error:"));
  db.connection.once("open", () => {
    console.log("Connected to MongoDB database");
  });
  return db;
};

module.exports.listTables = async function () {
  try {
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    return collections.map((collection) => collection.name);
  } catch (err) {
    throw err;
  }
};

module.exports.disconnect = async function () {
  await mongoose.disconnect();
};

module.exports.test = async function () {
  console.log("File name: dbHelper.js");
  console.log("Used env:");
  console.log("MONGO_CONNECTION: " + process.env.MONGO_CONNECTION);
  console.log("Variable testings: ");
  console.log("mongoDBConnectionString: " + mongoDBConnectionString);
};

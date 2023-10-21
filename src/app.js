require("dotenv").config();
const express = require("express");
const dbHelper = require("./dbHelper");
const testFile = require("./testFile");
const bodyParser = require("body-parser");
const { db } = require("./schema/dailyTaskSchema");
const { v4: uuidv4 } = require("uuid");
const DailyTask = require("./schema/dailyTaskSchema");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.use('/dailyTable', require('./routes/dailyTable'));

// test application
testFile.env();
testFile.dbHelper();

// Start the program
(async () => {
  try {
    const db = await dbHelper.connect();
    const collections = await dbHelper.listTables();

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
      console.log("Collections in the database:", collections);
    });
  } catch (err) {
    console.error("Error connecting to MongoDB database", err);
  }
})();

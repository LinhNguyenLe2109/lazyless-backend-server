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



// test application
testFile.env();
testFile.dbHelper();

// route definitions
// get all tasks
app.get("/", async (req, res) => {
  try {
    let db = await DailyTask.find();
    res.send(db);
  } catch (err) {
    throw new Error(
      "There is something wrong with the GET / request. Err: " + err
    );
  }
});

// Get tasks based on type
app.get("/taskType/:taskType", async (req, res) => {
  const type = req.params.taskType.toUpperCase();
  let db = await DailyTask.find({ taskType: type });
  res.json(db);
});

// get a task based on id
app.get("/task/:id", async (req, res) => {
  try {
    let db = await DailyTask.findOne({ id: req.params.id });
    res.json(db);
  } catch (err) {
    throw new Error(
      "There is something wrong with the GET /task/:id request. Err: " + err
    );
  }
});

// Add a task
app.post("/addTask", async (req, res) => {
  try {
    let task = new DailyTask({
      id: uuidv4(),
      taskDescription: req.body.taskDescription,
      taskType: req.body.taskType,
      completed: false,
    });
    await task.save();
    res.json(task);
  } catch (err) {
    throw new Error(
      "There is something wrong with the POST /addTask request. Err: " + err
    );
  }
});

// Update a task
app.put("/updateTask/:id", async (req, res) => {
  try {
    let task = await DailyTask.findOne({ id: req.params.id });
    const taskDescription = req.body.taskDescription;
    const taskType = req.body.taskType;
    const completed = req.body.completed;
    if (taskDescription) {
      task.setTaskDescription(taskDescription);
    }
    if (taskType) {
      // Check if the taskType is legit or not
      if (!DailyTask.verifyTaskType(taskType)) {
        throw new Error("Invalid task type");
      }
      task.setTaskType(taskType);
    }
    if (completed) {
      task.setCompleted(completed);
    }
    await task.save();
    res.json(task);
  } catch (err) {
    throw new Error("There is something wrong with the PUT request");
  }
});

// Delete a task
app.delete("/deleteTask/:id", async (req, res) => {
  try {
    let task = await DailyTask.findOne({ id: req.params.id });
    await DailyTask.deleteMany({ id: req.params.id });
    res.json(task);
  } catch (err) {
    throw new Error("There is something wrong with the DELETE request");
  }
});

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

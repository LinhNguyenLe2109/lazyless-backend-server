const express = require("express");
const router = express.Router();
const DailyTask = require("../schema/dailyTaskSchema");
const { v4: uuidv4 } = require("uuid");

// route definitions
// all routes have access to tableID from the URL in dailyTableAPI.js

// get all tasks
router.get("/", async (req, res) => {
  try {
    let db = await DailyTask.find({ parentTableId: req.params.tableID });
    res.send(db);
  } catch (err) {
    throw new Error(
      "There is something wrong with the GET / request. Err: " + err
    );
  }
});

// Get tasks based on type
router.get("/taskType/:taskType", async (req, res) => {
  const type = req.params.taskType.toUpperCase();
  let db = await DailyTask.find({
    taskType: type,
    parentTableId: req.params.tableID,
  });
  res.json(db);
});

// get a task based on id
router.get("/task/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    let db = await DailyTask.findOne({
      id: req.params.id,
      parentTableId: req.params.tableID,
    });
    res.json(db);
  } catch (err) {
    throw new Error(
      "There is something wrong with the GET /task/:id request. Err: " + err
    );
  }
});

// Add a task
router.post("/addTask", async (req, res) => {
  try {
    let task = new DailyTask({
      id: uuidv4(),
      taskDescription: req.body.taskDescription,
      taskType: req.body.taskType,
      completed: false,
      parentTableId: req.params.tableID,
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
router.put("/updateTask/:id", async (req, res) => {
  try {
    let task = await DailyTask.findOne({
      id: req.params.id,
      parentTableId: req.params.tableID,
    });
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
    if (completed != null) {
      task.setCompleted(completed);
    }
    await task.save();
    res.json(task);
  } catch (err) {
    throw new Error("There is something wrong with the PUT request");
  }
});

// Delete a task
router.delete("/deleteTask/:id", async (req, res) => {
  try {
    let task = await DailyTask.findOne({
      id: req.params.id,
      parentTableId: req.params.tableID,
    });
    await DailyTask.deleteOne({
      id: req.params.id,
      parentTableId: req.params.tableID,
    });
    res.json(task);
  } catch (err) {
    throw new Error("There is something wrong with the DELETE request");
  }
});

module.exports = router;

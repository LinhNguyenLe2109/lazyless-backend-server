const express = require("express");
const { v4: uuidv4 } = require("uuid");
const DailyLog = require("../schema/dailyLogSchema");
const DailyLogTask = require("../schema/dailyLogTaskSchema");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const dailyLogList = await DailyLogTask.find({
      parentLogId: req.params.tableID,
    }).sort({
      date: -1,
    });
    res.json(dailyLogList);
  } catch (err) {
    throw new Error(err);
  }
});

// add a task to a daily log
router.post("/addTask", async (req, res) => {
  try {
    // Check if table already exists
    const dailyLog = await DailyLog.findOne({
      parentLogId: req.params.tableID,
    });
    console.log("TableID: " + req.params.tableID);
    // Create a new task
    const newTask = new DailyLogTask({
      id: uuidv4(),
      taskName: req.body.taskName,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      taskType: req.body.taskType,
      note: req.body.note,
      parentLogId: req.params.tableID,
    });
    // Save the task
    const savedDailyLogTask = await newTask.save();
    // Add the task ID to the daily log
    dailyLog.dailyLogTaskList.push(newTask.id);
    // Save the daily log
    await dailyLog.save();
    // Return the saved task
    res.json(savedDailyLogTask);
  } catch (err) {
    throw new Error(err);
  }
});

// update a task in a daily log
router.put("/updateTask/:id", async (req, res) => {
  try {
    const task = await DailyLogTask.findOne({
      id: req.params.id,
      parentLogId: req.params.tableID,
    });
    if (req.body.taskName && req.body.taskName !== "") {
      task.taskName = req.body.taskName;
    }
    if (req.body.startTime && typeof req.body.startTime == Date) {
      task.startTime = req.body.startTime;
    }
    if (req.body.endTime && typeof req.body.endTime == Date) {
      task.endTime = req.body.endTime;
    }
    if (req.body.taskType && req.body.taskType !== "") {
      task.taskType = req.body.taskType;
    }
    if (req.body.note && req.body.note !== "") {
      task.note = req.body.note;
    }
    // Add the updated task back to the task list
    const savedDailyLog = await task.save();
    res.json(savedDailyLog);
  } catch (err) {
    throw new Error(err);
  }
});

// Delete a task from a daily log
router.delete("/deleteTask/:id", async (req, res) => {
  try {
    // Find the daily log
    const dailyLog = await DailyLog.findOne({
      id: req.params.tableID,
    });
    // Delete the task
    const deletedTask = await DailyLogTask.deleteOne({
      id: req.params.id,
      parentLogId: req.params.tableID,
    });
    // Remove the task ID from the daily log
    const dailyLogTaskList = dailyLog.dailyLogTaskList;
    const newDailyLogTaskList = dailyLogTaskList.filter(
      (id) => id !== req.params.id
    );
    dailyLog.dailyLogTaskList = newDailyLogTaskList;
    await dailyLog.save();
    res.json(deletedTask);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = router;

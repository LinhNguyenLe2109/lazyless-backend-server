const express = require("express");
const { v4: uuidv4 } = require("uuid");
const DailyLog = require("../schema/dailyLogSchema");
const User = require("../schema/userSchema");

const router = express.Router();

// get all daily logs
router.get("/", async (req, res) => {
  try {
    const userID = req.user.id;
    const dailyLogList = await DailyLog.find({ userID: userID }).sort({
      date: -1,
    });
    res.json(dailyLogList);
  } catch (err) {
    res.json({ message: err });
  }
});

// get a daily log based on id
router.get("/:id", async (req, res) => {
  try {
    const dailyLog = await DailyLog.findOne({ id: req.params.id });
    res.json(dailyLog);
  } catch (err) {
    res.json({ message: err });
  }
});

// add a daily log
router.post("/add", async (req, res) => {
  // Check if table already exists
  const targetDate = new Date();

  // Create a range for the entire day of the target date
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  let existingLog;
  // Check if the daily log already exists
  try {
    existingLog = await DailyLog.findOne({
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
      userID: req.user.id,
    });
  } catch (err) {
    res.json({ message: err });
  }
  // if the daily log already exists, return err
  if (existingLog) {
    throw new Error({ message: "Log already exists" });
  } else {
    // Create a new log
    const dailyLog = new DailyLog({
      id: uuidv4(),
      date: targetDate,
      userID: req.user.id,
      dailyLogTaskList: [],
    });

    try {
      // Save the daily log
      const savedDailyLog = await dailyLog.save();
      //   Save the daily log id to the user's dailyLogList
      await User.updateOne(
        { id: req.user.id },
        { $push: { dailyLogList: savedDailyLog.id } }
      );
      res.json(savedDailyLog);
    } catch (err) {
      res.json({ message: err });
    }
  }
});

// add a task to a daily log
router.post("/:id/addTask", async (req, res) => {
  try {
    const dailyLog = await DailyLog.findOne({ id: req.params.id });
    const newTask = {
      id: uuidv4(),
      taskName: req.body.taskName,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      taskType: req.body.taskType,
      note: req.body.note,
    };
    dailyLog.dailyLogTaskList.push(newTask);
    const savedDailyLog = await dailyLog.save();
    res.json(savedDailyLog);
  } catch (err) {
    res.json({ message: err });
  }
});

// update a task in a daily log
router.put("/:id/updateTask/:taskID", async (req, res) => {
  try {
    const dailyLog = await DailyLog.findOne({ id: req.params.id });
    const dailyLogTaskList = dailyLog.dailyLogTaskList;
    // Find the task to be updated
    const task = dailyLogTaskList.find((task) => task.id === req.params.taskID);
    // Remove the task to be updated from the task list
    const newDailyLogTaskList = dailyLogTaskList.filter(
      (task) => task.id !== req.params.taskID
    );
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
    task.note = req.body.note;
    // Add the updated task back to the task list
    newDailyLogTaskList.push(task);
    dailyLog.dailyLogTaskList = newDailyLogTaskList;
    const savedDailyLog = await dailyLog.save();
    res.json(savedDailyLog);
  } catch (err) {
    res.json({ message: err });
  }
});

// Delete a task from a daily log
router.delete("/:id/deleteTask/:taskID", async (req, res) => {
  try {
    const dailyLog = await DailyLog.findOne({ id: req.params.id });
    const dailyLogTaskList = dailyLog.dailyLogTaskList;
    const newDailyLogTaskList = dailyLogTaskList.filter(
      (task) => task.id !== req.params.taskID
    );
    dailyLog.dailyLogTaskList = newDailyLogTaskList;
    const savedDailyLog = await dailyLog.save();
    res.json(savedDailyLog);
  } catch (err) {
    res.json({ message: err });
  }
});

// Delete a daily log
router.delete("/delete/:id", async (req, res) => {
  try {
    const dailyLog = await DailyLog.findOne({ id: req.params.id });
    if (!dailyLog) {
      res.json({ message: "This daily log does not exist" });
    }
    const result = await DailyLog.deleteOne({ id: req.params.id });
    if (result.deletedCount != 1) {
      res.json({ message: "This daily log was found but not deleted" });
    }
    // Remove the daily log id from the user's dailyLogList
    User.updateOne(
      { id: req.user.id },
      { $pull: { dailyLogList: req.params.id } }
    );
    res.json({ completed: true });
  } catch (err) {
    res.json({ message: err });
  }
});


module.exports = router;

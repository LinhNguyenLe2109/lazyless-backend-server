const express = require("express");
const { v4: uuidv4 } = require("uuid");
const DailyLog = require("../schema/dailyLogSchema");
const User = require("../schema/userSchema");
const DailyLogTask = require("../schema/dailyLogTaskSchema");

const router = express.Router();

router.use("/:tableID/task", require("./dailyLogTaskAPI"));

// get all daily logs
router.get("/", async (req, res) => {
  try {
    const userID = req.user.id;
    const dailyLogList = await DailyLog.find({ userID: userID }).sort({
      date: -1,
    });
    res.json(dailyLogList);
  } catch (err) {
    throw new Error(err);
  }
});

// get a daily log based on id
router.get("/:id", async (req, res) => {
  try {
    const dailyLog = await DailyLog.findOne({ id: req.params.id });
    res.json(dailyLog);
  } catch (err) {
    throw new Error(err);
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

  let existingLog = false;
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
    throw new Error(err);
  }
  // if the daily log already exists, return err
  if (existingLog) {
    throw new Error({ message: "Log already exists" });
  } else {
    // Create a new log
    const dailyLogID = uuidv4();
    const dailyLog = new DailyLog({
      id: dailyLogID,
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
      throw new Error(err);
    }
  }
});

// Delete a daily log
router.delete("/delete/:id", async (req, res) => {
  try {
    const result = await DailyLog.deleteOne({ id: req.params.id });
    if (!result) {
      res.json({ message: "This daily log does not exist" });
    }
    if (result.deletedCount != 1) {
      res.json({ message: "This daily log was found but not deleted" });
    }
    if (result.dailyLogTaskList?.length > 0) {
      for (let i = 0; i < result.dailyLogTaskList.length; i++) {
        await DailyLogTask.deleteOne({ id: result.dailyLogTaskList[i] });
      }
    }

    // Remove the daily log id from the user's dailyLogList
    User.updateOne({ id: req.user.id }, { $pull: { dailyLogList: result.id } });
    res.json({ completed: true });
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = router;

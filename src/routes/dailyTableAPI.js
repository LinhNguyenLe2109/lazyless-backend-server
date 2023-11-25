const express = require("express");
const DailyTable = require("../schema/dailyTableSchema");
const DailyTask = require("../schema/dailyTaskSchema");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// direct to daily task API
router.use("/:tableID/dailyTask", require("./dailyTaskAPI"));

// get all daily tables
router.get("/", async (req, res) => {
  try {
    const userID = req.user.id;
    const dailyTable = await DailyTable.find({ userID: userID }).sort({
      date: -1,
    });
    res.json(dailyTable);
  } catch (err) {
    res.json({ message: err });
  }
});

// get a daily table based on id
router.get("/:id", async (req, res) => {
  try {
    const dailyTable = await DailyTable.findOne({ id: req.params.id });
    res.json(dailyTable);
  } catch (err) {
    res.json({ message: err });
  }
});

// get a number of daily tables
router.get("/count", async (req, res) => {
  try {
    res.json({ num: req.user.dailyTableList.length });
  } catch (err) {
    res.json({ message: err });
  }
});

// add a daily table
router.post("/add", async (req, res) => {
  // Check if table already exists
  const targetDate = new Date();

  // Create a range for the entire day of the target date
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  let existingTable;

  try {
    existingTable = await DailyTable.findOne({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      userID: req.user.id,
    });
  } catch (err) {
    res.json({ message: err });
  }
  if (!existingTable) {
    //add new table
    try {
      // Create a new daily table object
      const dailyTableID = uuidv4();
      const dailyTable = new DailyTable({
        id: dailyTableID,
        taskIdList: [],
        date: new Date(),
        completedAll: false,
        completedRate: 0,
        userID: req.user.id,
      });
      // Save the daily table object
      const savedDailyTable = await dailyTable.save();
      // Add the daily table id to the user's daily table list
      await User.updateOne(
        { id: req.user.id },
        { $push: { dailyTableList: dailyTableID } }
      );
      res.json(savedDailyTable);
    } catch (err) {
      res.json({ message: err });
    }
  } else {
    res.json(null);
  }
});

// add a task into the table array
router.put("/:tableID/addTask/:taskID", async (req, res) => {
  const result = await DailyTable.updateOne(
    { id: req.params.tableID },
    { $push: { taskIdList: req.params.taskID } }
  );
  if (result.n != 1) {
    res.json({ message: "This daily table does not exist" });
  }
  if (result.nModified != 1) {
    res.json({ message: "This daily table was found but not updated" });
  }
  res.json({ completed: true });
});

// delete a daily table
router.delete("/delete/:id", async (req, res) => {
  try {
    let dailyTable = await DailyTable.findOne({
      id: req.params.id,
    });
    if (!dailyTable) {
      res.json({ message: "This daily table does not exist" });
    }
    for (let i = 0; i < dailyTable.taskIdList.length; i++) {
      await DailyTask.deleteOne({ id: dailyTable.taskIdList[i] });
    }
    const removedDailyTable = await DailyTable.deleteOne({ id: req.params.id });
    res.json(removedDailyTable);
  } catch (err) {
    res.json({ message: "Something is wrong here with /delete" });
  }
});

module.exports = router;

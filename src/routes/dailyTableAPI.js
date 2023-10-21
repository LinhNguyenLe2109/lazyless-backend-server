const express = require("express");
const router = express.Router();
const DailyTable = require("../schema/dailyTableSchema");
const DailyTask = require("../schema/dailyTaskSchema");
const { v4: uuidv4 } = require("uuid");

// direct to daily task API
router.use("/:tableID/dailyTask", require("./dailyTaskAPI.js"));

// get all daily tables
router.get("/", async (req, res) => {
  try {
    const dailyTable = await DailyTable.find();
    res.json(dailyTable);
  } catch (err) {
    res.json({ message: err });
  }
});

// get a daily table based on id
router.get("/:id", async (req, res) => {
  try {
    const dailyTable = await DailyTable.findById(req.params.id);
    res.json(dailyTable);
  } catch (err) {
    res.json({ message: err });
  }
});

// get a number of daily tables
router.get("/count", async (req, res) => {
  try {
    const dailyTableCount = await DailyTable.countDocuments();
    res.json({ num: dailyTableCount });
  } catch (err) {
    res.json({ message: err });
  }
});

// add a daily table
router.post("/add", async (req, res) => {
  try {
    const dailyTable = new DailyTable({
      id: uuidv4(),
      taskIdList: [],
      date: new Date(),
      completedAll: false,
      completedRate: 0,
    });
    const savedDailyTable = await dailyTable.save();
    res.json(savedDailyTable);
  } catch (err) {
    res.json({ message: err });
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
    let dailyTable = await DailyTable.findById(req.params.id);
    if (!dailyTable) {
      res.json({ message: "This daily table does not exist" });
    }
    for (let i = 0; i < dailyTable.taskIdList.length; i++) {
      await DailyTask.deleteOne({ id: dailyTable.taskIdList[i] });
    }
    const removedDailyTable = await DailyTable.remove({ id: req.params.id });
    res.json(removedDailyTable);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;

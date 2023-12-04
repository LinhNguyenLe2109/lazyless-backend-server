const mongoose = require("mongoose");
const { Schema } = mongoose;

const dailyLogTaskSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  taskName: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  taskType: {
    type: String,
    required: true,
  },
  note: {
    type: String,
  },
});

const dailyLogSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  date: {
    type: Date,
    required: true,
    default: new Date(),
  },
  dailyLogTaskList: {
    type: [dailyLogTaskSchema],
    default: undefined,
  },
  userID: {
    type: String,
    required: true,
  },
});

const DailyLogSchema = mongoose.model("dailyLog", dailyLogSchema);

module.exports = DailyLogSchema;

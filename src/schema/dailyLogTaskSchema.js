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
  parentLogId: {
    type: String,
    required: true,
  },
});

const DailyLogTaskSchema = mongoose.model("dailyLogTask", dailyLogTaskSchema);

module.exports = DailyLogTaskSchema;

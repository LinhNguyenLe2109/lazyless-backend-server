const mongoose = require("mongoose");
const { Schema } = mongoose;

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
    type: [
      {
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
      },
    ],
    required: true,
    default: [],
  },
  userID: {
    type: String,
    required: true,
  },
});

const DailyLogSchema = mongoose.model("dailyLog", dailyLogSchema);

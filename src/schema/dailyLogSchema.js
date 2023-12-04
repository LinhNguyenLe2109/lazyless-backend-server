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
    type: [String],
    required: true,
    default: [],
  },
  userID: {
    type: String,
    required: true,
  },
});

const DailyLogSchema = mongoose.model("dailyLog", dailyLogSchema);

module.exports = DailyLogSchema;

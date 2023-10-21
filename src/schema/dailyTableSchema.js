const mongoose = require("mongoose");
const { Schema } = mongoose;
const { v4: uuidv4 } = require("uuid");

const dailyTableSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  taskIdList: {
    type: [String],
    required: true,
    default: [],
  },
  date: {
    type: Date,
    required: true,
    default: new Date(),
  },
  completedAll: {
    type: Boolean,
    required: true,
    default: false,
  },
  completedRate: {
    type: Number,
    required: true,
    default: 0,
  },
});

const DailyTable = mongoose.model("dailyTable", dailyTableSchema);
module.exports = DailyTable;
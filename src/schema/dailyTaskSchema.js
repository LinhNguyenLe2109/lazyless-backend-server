const mongoose = require("mongoose");
const { Schema } = mongoose;
const { v4: uuidv4 } = require("uuid");

const dailyTaskSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  taskDescription: {
    type: String,
    required: true,
  },
  taskType: {
    type: String,
    required: true,
  },
  competed: {
    type: Boolean,
    required: true,
    default: false,
  },
});

// do I even need this or I can just set the values directly?

dailyTaskSchema.methods.setTaskDescription = function (taskDescription) {
  this.taskDescription = taskDescription;
};

dailyTaskSchema.methods.setTaskType = function (taskType) {
  this.taskType = taskType;
};

dailyTaskSchema.methods.setCompleted = function (completed) {
  this.completed = completed;
};

// check if the taskType is legit or not
// params taskType: string
// return: boolean
dailyTaskSchema.statics.verifyTaskType = function (taskType) {
  if (
    taskType === "U-I" ||
    taskType === "NU-I" ||
    taskType === "U-NI" ||
    taskType === "NU-NI"
  ) {
    return true;
  }
  return false;
};

const DailyTask = mongoose.model("dailyTask", dailyTaskSchema);
module.exports = DailyTask;

// module.exports.connect = function () {
//   return new Promise(function (resolve, reject) {
//     let db = mongoose.createConnection(mongoDBConnectionString);

//     db.on("error", (err) => {
//       reject(err);
//     });

//     db.once("open", () => {
//       User = db.model("dailyTask", dailyTaskSchema);
//       resolve();
//     });
//   });
// };
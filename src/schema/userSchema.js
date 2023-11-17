const mongoose = require("mongoose");
const { Schema } = mongoose;
const { v4: uuidv4 } = require("uuid");

const userSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  userName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  dailyTableList: {
    type: [String],
    required: true,
    default: [],
  },
});

const User = mongoose.model("user", userSchema);
module.exports = User;

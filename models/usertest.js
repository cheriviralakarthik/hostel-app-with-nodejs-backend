const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema({
  bedno: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
  },
  address: {
    type: String,
  },
  aadhar: {
    type: String,
  },
  amountpaid: {
    type: String,
  },
  typeofamountpaid: {
    type: String,
  },
});

const roomSchema = new mongoose.Schema({
  roomno: {
    type: Number,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  beds: [bedSchema],
});

const floorSchema = new mongoose.Schema({
  floorno: {
    type: Number,
    required: true,
  },
  rooms: [roomSchema],
});

const requestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phno: {
    type: Number,
    required: true,
  },
  dts: {
    type: Number,
    required: true,
  },
});
const usertest = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  area: {
    type: String,
    required: true,
  },
  pincode: {
    type: Number,
    required: true,
  },
  hostelname: {
    type: String,
    required: true,
  },
  pricestarts: {
    type: Number,
    required: true,
  },
  requests: [requestSchema],
  floors: [floorSchema],
});

module.exports = mongoose.model("usertest", usertest);

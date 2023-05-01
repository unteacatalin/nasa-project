const mongoose = require('mongoose');

const LaunchSchema = new mongoose.Schema({
  flightNumber: {
    type: Number,
    required: [true, 'Plase provide a flight number'],
  },
  mission: {
    type: String,
    required: [true, 'Please provide mission name'],
  },
  rocket: {
    type: String,
    required: [true, 'Please provide rocket'],
  },
  launchDate: {
    type: Date,
    required: [true, 'Please provide a launch date'],
  },
  target: {
    type: mongoose.Types.ObjectId,
    ref: 'HabitablePlanet',
    required: [true, 'Please provide a target planet'],
  },
  customers: {
    type: [String],
  },
  upcoming: {
    type: Boolean,
    default: true,
  },
  success: {
    type: Boolean,
    default: true,
  },
});

LaunchSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'target',
    select: '-__v',
  });
  next();
});

module.exports = mongoose.model('Launch', LaunchSchema);

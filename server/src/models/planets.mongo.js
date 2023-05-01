const mongoose = require('mongoose');

const HabitablePlanetSchema = new mongoose.Schema({
  keplerName: {
    type: String,
    required: [true, 'Please provide a planet name'],
    unique: true,
  },
});

module.exports = mongoose.model('HabitablePlanet', HabitablePlanetSchema);

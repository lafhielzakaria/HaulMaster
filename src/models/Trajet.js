const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    departureSite: {
      type: String,
      required: true
    },
    arrivalSite: {
      type: String,
      required: true
    },
    plannedStart: {
      type: Date,
      required: true
    },
    plannedEnd: {
      type: Date,
      required: true
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    camion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Camion',
      required: true
    },
    remorque: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Remorque',
      required: true
    },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'],
      default: 'TODO'
    },
    startMileage:       { type: Number },
    endMileage:         { type: Number },
    fuelConsumed:       { type: Number },
    fuelCost:           { type: Number },
    distance:           { type: Number },
    averageConsumption: { type: Number },
    driverRemarks:      { type: String },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Trajet', tripSchema);

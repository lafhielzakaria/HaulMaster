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
    startMileage: {
      type: Number,
      default: null
    },
    endMileage: {
      type: Number,
      default: null
    },
    fuelConsumed: {
      type: Number,
      default: null
    },
    fuelCost: {
      type: Number,
      default: null
    },
    distance: {
      type: Number,
      default: null
    },
    averageConsumption: {
      type: Number,
      default: null
    },
    driverRemarks: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Trajet', tripSchema);

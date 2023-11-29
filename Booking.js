const mongoose = require('mongoose');
const uuid = require('uuid');

const bookingSchema = new mongoose.Schema({
    _id: { type: String, default: uuid.v4 },
    name: String,
    date: Date,
    time: String,
    payment: Number,
    workshop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workshop'
    },
    card: String,
    cardExpiryDate: String,
    cvc: String,
    notes: String,
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;

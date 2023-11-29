const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
    name: String,
    description: String,
    schedule: [
        {
            date: Date,
            time: String,
            availableSlots: Number,
        }],
});

const Workshop = mongoose.model('Workshop', workshopSchema);

module.exports = Workshop;

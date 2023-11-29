const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const uuid = require('uuid');
const app = express();
const port = 3000;

const Workshop = require('./Workshop');
const Booking = require('./Booking');

mongoose.connect('mongodb://127.0.0.1:27017/workshop', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/bookings', (req, res) => {
    Booking.find().populate('workshop', 'name')
        .then(bookings => {
            const bookingsWithNames = bookings.map(booking => {
                const bookingObj = booking.toObject();
                bookingObj.workshopName = booking.workshop.name;
                return bookingObj;
            });
            res.render('bookings', { bookings: bookingsWithNames });
        })
        .catch(err => res.status(500).send(err.message));
});

app.get('/create-booking', (req, res) => {
    Workshop.find()
        .then(workshops => res.render('create-booking-form', { workshops: workshops }))
        .catch(err => res.status(500).send(err.message));
});

app.post('/create-booking', (req, res) => {
    const workshopName = req.body.workshopName;

    Workshop.findOne({ name: workshopName })
        .then(workshop => {
            if (!workshop) {
                throw new Error('Workshop not found');
            }

            const newBooking = new Booking({
                name: req.body.name,
                date: req.body.date,
                time: req.body.time,
                payment: req.body.payment,
                workshop: workshop._id, // Use the ObjectId of the workshop
                card: req.body.card,
                cardExpiryDate: req.body.cardExpiryDate,
                cvc: req.body.cvc,
                notes: req.body.notes,
            });

            return newBooking.save();
        })
        .then(() => res.redirect('/bookings'))
        .catch(err => res.status(500).send(err.message));
});



app.get('/delete-booking/:id', (req, res) => {
    let bookingToDelete;
    Booking.findById(req.params.id)
        .then(booking => {
            bookingToDelete = booking;
            return Booking.findByIdAndRemove(req.params.id);
        })
        .then(() => Workshop.findOneAndUpdate(
            { 'schedule._id': bookingToDelete.workshop },
            { $inc: { 'schedule.$.availableSlots': 1 } }
        ))
        .then(() => res.redirect('/bookings'))
        .catch(err => res.status(500).send(err.message));
});

app.get('/modify-booking/:id', (req, res) => {
    let bookingToEdit;
    Booking.findById(req.params.id)
        .then(booking => {
            bookingToEdit = booking;
            return Workshop.find();
        })
        .then(workshops => res.render('modify-booking', { booking: bookingToEdit, workshops }))
        .catch(err => res.status(500).send(err.message));
});

app.post('/modify-booking/:id', (req, res) => {
    Booking.findByIdAndUpdate(req.params.id, req.body)
        .then(() => res.redirect('/bookings'))
        .catch(err => res.status(500).send(err.message));
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/help', (req, res) => {
    res.render('help');
});

app.get('/scheduled-workshops', (req, res) => {
    Workshop.find()
        .then(workshops => res.render('scheduled-workshops', { workshops }))
        .catch(err => res.status(500).send(err.message));
});

app.get('/report-on-scheduled-workshops', (req, res) => {
  
    Workshop.find()
        .then(workshops => {
            res.render('report-on-scheduled-workshops', { workshops: workshops });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error retrieving scheduled workshops.');
        });
});

app.listen(port, () => console.log(`Server is running on port ${port}`));

// Import routes
const slotRoutes = require('./routes/slotRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Mount routes
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes); 
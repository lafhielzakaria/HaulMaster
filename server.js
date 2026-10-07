require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const tripRoutes = require('./src/routes/tripRoutes');
const fleetRoutes = require('./src/routes/fleetRoutes');
const pneuRoutes = require('./src/routes/pneuRoutes');
const remorqueRoutes = require('./src/routes/remorqueRoutes');
const app = express();
app.use(express.json());
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/pneu', pneuRoutes);
app.use('/api/remorques', remorqueRoutes);
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ message: err.message });
});
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

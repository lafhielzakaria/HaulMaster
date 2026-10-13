/*V2 tasks: 
-analyse  : ndir function treturni kola driver ou score dyalo z3ma 3la kola total dyal xral consomma dyal fuel 3la total dyal km * 100

*/

require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');
const connectDB = require('./src/config/db');
const app = express();
app.use(express.json());
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1', require('./src/routes/v1'));
app.use('/api/v2', require('./src/routes/v2'));
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ message: err.message });
});
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

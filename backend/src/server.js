require('dotenv').config();
const app = require('./app');
const connectDatabase = require('./config/db');

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();
    app.listen(port, () => {
      console.log(`WeeklyHub API running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
}

startServer();

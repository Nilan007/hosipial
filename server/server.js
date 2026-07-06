import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import router from './routes.js';

const app = express();
const PORT = process.env.PORT || 5050;
const MONGODB_URI = 'mongodb+srv://antig9992_db_user:JYWaeWx8TEr9dzw5@cluster0.qsz86jd.mongodb.net/hms?retryWrites=true&w=majority';

app.use(cors());
app.use(express.json());

// API router mount
app.use('/api', router);

// Default status probe
app.get('/', (req, res) => {
  res.json({ status: 'MediCore HMS Database Server Online', database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' });
});

console.log('Connecting to MongoDB Atlas Cluster...');
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully.');
    app.listen(PORT, () => {
      console.log(`MediCore HMS Express server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB database connection failure:', err);
    process.exit(1);
  });

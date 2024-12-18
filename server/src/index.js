import app from './app.js';
import { seedDemoData } from './services/seedData.js';

const PORT = process.env.PORT || 3000;

// Initialize demo data
seedDemoData().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
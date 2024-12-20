import app from './app.js';
import { prisma } from './services/prisma.js';

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
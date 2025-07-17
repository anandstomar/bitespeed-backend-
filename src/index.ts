import express from 'express';
import dotenv from 'dotenv';
import identifyRoutes from './routes/identify';
import { Request, Response } from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', identifyRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, backend is running !');
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

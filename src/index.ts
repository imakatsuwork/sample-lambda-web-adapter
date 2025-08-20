import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

app.get('/api/sample', (req: Request, res: Response) => {
  const sampleResponse = {
    message: 'This is a sample API response',
    timestamp: new Date().toISOString(),
    data: {
      id: 1,
      name: 'Sample Item',
      description: 'This is a fixed JSON response from the API',
      attributes: {
        type: 'demo',
        version: '1.0.0'
      }
    }
  };
  
  res.json(sampleResponse);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
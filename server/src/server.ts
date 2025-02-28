import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import path from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
dotenv.config();

// Import the routes
import routes from './routes/index.js';

const app = express();

const PORT = process.env.PORT || 3001;

// TODO: Serve static files of entire client dist folder
app.use(express.static(path.join(__dirname, '../../client/dist')));

// TODO: Implement middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// TODO: Implement middleware to connect the routes
app.use(routes);

const historyFilePath = path.join(__dirname, '../../db/searchHistory.json');

// GET /api/weather/history
app.get('/api/weather/history', async (req: Request, res: Response) => {
  try {
    const data = await fs.readFile(historyFilePath, 'utf-8');
    const cities = JSON.parse(data);
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read search history' });
  }
});

// POST /api/weather
app.post('/api/weather', async (req: Request, res: Response) => {
    const { city } = req.body;
    if (!city) {
      return res.status(400).json({ error: 'City name is required' });
    }
  
    try {
      const data = await fs.readFile(historyFilePath, 'utf-8');
      const cities = JSON.parse(data);
  
      const newCity = { id: uuidv4(), name: city };
      cities.push(newCity);
  
      await fs.writeFile(historyFilePath, JSON.stringify(cities, null, 2), 'utf-8');
  
      // Here you would fetch the weather data for the city
      // For now, we'll just return the new city object
      res.json(newCity);
    } catch (error) {
      console.error('Error saving city:', error);
      res.status(500).json({ error: 'Failed to save city' });
    }
  });

  // Catch-all route to serve index.html for any other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });

// Start the server on the port
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));

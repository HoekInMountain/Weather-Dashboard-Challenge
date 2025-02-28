import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const historyFilePath = path.join(__dirname, '../../../db/searchHistory.json');

interface City {
  id: string;
  name: string;
}

class HistoryService {
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(historyFilePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  private async write(cities: City[]): Promise<void> {
    await fs.writeFile(historyFilePath, JSON.stringify(cities, null, 2));
  }

  async getCities(): Promise<City[]> {
    return this.read();
  }

  async addCity(city: string): Promise<void> {
    const cities = await this.read();
    const newCity: City = { id: uuidv4(), name: city };
    cities.push(newCity);
    await this.write(cities);
  }

  async removeCity(id: string): Promise<void> {
    const cities = await this.read();
    const updatedCities = cities.filter(city => city.id !== id);
    await this.write(updatedCities);
  }
}

export default new HistoryService();
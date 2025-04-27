import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import csv from 'csv-parser';
import Player from '../models/Player.js';
import connectDB from '../config/db.js';

dotenv.config();
await connectDB();

const players = [];

fs.createReadStream('utils/players.csv')
  .pipe(csv())
  .on('data', (row) => {
    const careerMap = new Map();

    Object.keys(row).forEach((key) => {
      if (key !== 'Player') {
        const year = key.trim();
        const team = row[key].trim() || 'na';
        careerMap.set(year, team);
      }
    });

    players.push({
      playerName: row['Player'].trim(),
      career: Object.fromEntries(careerMap),
    });
  })
  .on('end', async () => {
    try {
      await Player.deleteMany(); // clean old
      await Player.insertMany(players);
      console.log('✅ Player data imported successfully!');
      process.exit();
    } catch (error) {
      console.error('❌ Error importing player data:', error);
      process.exit(1);
    }
  });

import express from 'express';
import { getRandomPlayer, checkGuess } from '../controllers/playerController.js';

const router = express.Router();

router.get('/random', getRandomPlayer);
router.post('/guess', checkGuess);

export default router;

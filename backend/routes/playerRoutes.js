import express from 'express';
import { getRandomPlayer, checkGuess, getHint, getSquad } from '../controllers/playerController.js';

const router = express.Router();

router.get('/random', getRandomPlayer);
router.post('/guess', checkGuess);
router.post('/hint', getHint);
router.post('/squad', getSquad);

export default router;

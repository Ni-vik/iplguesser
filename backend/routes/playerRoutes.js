import express from 'express';
import { getRandomPlayer, checkGuess, getHint, getSquad , leaderBoardUpdate ,topScoreGenerator , getScore , updateScore } from '../controllers/playerController.js';

const router = express.Router();

router.get('/random', getRandomPlayer);
router.post('/guess', checkGuess);
router.post('/hint', getHint);
router.post('/squad', getSquad);
router.post('/postscore' , leaderBoardUpdate );
router.get('/getscore' , topScoreGenerator );
router.post('/getscorebyuser' , getScore);
router.post('/updatescorebyuser' , updateScore);

export default router;

import express from 'express';
import { getRandomPlayer, checkGuess, getHint, getSquad , leaderBoardUpdate ,topScoreGenerator , getScore , updateScore } from '../controllers/playerController.js';
import { checkDevice , registerUser } from '../controllers/user.js';
import {getRoomScoreboard, createRoom ,joinroom , startGame , getplayer , submitRoomScore } from '../controllers/rooms.js';
const router = express.Router();

router.get('/random', getRandomPlayer);
router.post('/guess', checkGuess);
router.post('/hint', getHint);
router.post('/squad', getSquad);
router.post('/postscore' , leaderBoardUpdate );
router.get('/getscore' , topScoreGenerator );
router.post('/getscorebyuser' , getScore);
router.post('/updatescorebyuser' , updateScore);
router.get('/checkdevice' , checkDevice);
router.post('/registeruser' , registerUser);
router.post('/createroom' ,createRoom );
router.post('/startgame',startGame);
router.post('/joinroom', joinroom );

// Express route
router.get('/:roomId/player/:index', getplayer);
router.post('/submitscore', submitRoomScore);
router.get('/:roomId/scoreboard', getRoomScoreboard);



export default router;

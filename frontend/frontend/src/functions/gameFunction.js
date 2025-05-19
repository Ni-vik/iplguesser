import { useEffect, useState } from "react";
import { getRandomPlayer,checkPlayerGuess,getHint,leaderBoardUpdate, getLeaderBoard } from "../api/playerApi";
import Autosuggest from "react-autosuggest";
import LogoCard from "../components/LogoCard";
import GuessInput from "../components/GuessInput";
import playerNames from "../players/players.json";
import confetti from "canvas-confetti";
import { useRef } from "react";
import ScoreDisplay from "../components/scoreDisplay";
import { checkDevice , registerUser } from "../api/playerApi";

export function launchConfetti() {
  confetti({
    particleCount: 150,
    spread: 90,
    origin: { y: 0.6 },
  });
}

export function getDeviceId(){
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("deviceId", deviceId);
    }
}

export const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
  };
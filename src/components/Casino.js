import React, { useState, useEffect, useRef } from 'react';
import {
  PiNumberCircleEight, PiNumberCircleFive, PiNumberCircleFour,
  PiNumberCircleNine, PiNumberCircleOne, PiNumberCircleSeven,
  PiNumberCircleSix, PiNumberCircleThree, PiNumberCircleTwo,
  PiNumberCircleZero, PiPokerChip
} from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import SlotColumn from './SlotColumn';
import './SlotColumn.css';

function Casino() {
  const state = [
    { number: 1, icon: <PiNumberCircleOne size={48} weight="fill" />, isPoker: false },
    { number: 2, icon: <PiNumberCircleTwo size={48} weight="fill" />, isPoker: false },
    { number: 3, icon: <PiNumberCircleThree size={48} weight="fill" />, isPoker: false },
    { number: 4, icon: <PiNumberCircleFour size={48} weight="fill" />, isPoker: false },
    { number: 5, icon: <PiNumberCircleFive size={48} weight="fill" />, isPoker: false },
    { number: 6, icon: <PiNumberCircleSix size={48} weight="fill" />, isPoker: false },
    { number: 7, icon: <PiNumberCircleSeven size={48} weight="fill" />, isPoker: false },
    { number: 8, icon: <PiNumberCircleEight size={48} weight="fill" />, isPoker: false },
    { number: 9, icon: <PiNumberCircleNine size={48} weight="fill" />, isPoker: false },
    { number: 10, icon: <PiNumberCircleZero size={48} weight="fill" />, isPoker: false },
    { number: 11, icon: <PiPokerChip size={48} weight="fill" />, isPoker: true }
  ];

  const [allReel, setAllReels] = useState(state);
  const [reels, setReels] = useState([state[0], state[1], state[2]]);
  const [message, setMessage] = useState('');
  const [dinero, setDinero] = useState(100);
  const [apuesta, setApuesta] = useState(10);
  const [ganancia, setGanancia] = useState(0);
  const navigate = useNavigate();

  const [isSpinningSlot1, setIsSpinningSlot1] = useState(false);
  const [isSpinningSlot2, setIsSpinningSlot2] = useState(false);
  const [isSpinningSlot3, setIsSpinningSlot3] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const spinSoundRef = useRef(new Audio('/sounds/spin.mp3'));
  const bgAudioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const bgAudio = new Audio('/sounds/background.mp3');
    bgAudio.loop = true;
    bgAudio.volume = 0.4;
    bgAudio.muted = isMuted;
    bgAudioRef.current = bgAudio;

    if (!isMuted) {
      bgAudio.play().catch(err => console.warn("AutoPlay blockeado"));
    }

    return () => {
      bgAudio.pause();
      bgAudio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    const bgAudio = bgAudioRef.current;
    if (bgAudio) {
      bgAudio.muted = isMuted;
      if (!isMuted) {
        bgAudio.play().catch(err => console.warn("AutoPlay blockeado"));
      } else {
        bgAudio.pause();
      }
    }
  }, [isMuted]);

  function toggleMute() {
    setIsMuted(prev => !prev);
  }

  useEffect(() => {
    if (shouldAnimate) {
      const timer = setTimeout(() => setShouldAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shouldAnimate]);

  const [finalIndex1, setFinalIndex1] = useState(0);
  const [finalIndex2, setFinalIndex2] = useState(0);
  const [finalIndex3, setFinalIndex3] = useState(0);

  function slotSpin() {
    const spinSound = spinSoundRef.current;
    spinSound.currentTime = 0;
    spinSound.volume = 0.3;
    spinSound.play().catch(console.error);

    const f1 = Math.floor(Math.random() * allReel.length);
    const f2 = Math.floor(Math.random() * allReel.length);
    const f3 = Math.floor(Math.random() * allReel.length);

    setFinalIndex1(f1);
    setFinalIndex2(f2);
    setFinalIndex3(f3);

    setMessage("SPIN...");
    setIsSpinningSlot1(true);
  }

  function winOrLose(newReel) {
    let multiplyPoker = 1;
    const isPokerMatch = newReel.filter(item => item.isPoker).length;
    if (isPokerMatch === 2) multiplyPoker = 5;
    if (isPokerMatch === 3) multiplyPoker = 10000000;

    if (newReel[0] === newReel[1] && newReel[1] === newReel[2]) {
      setGanancia(apuesta * 5 * multiplyPoker);
      setMessage("jackpot");
      moneyUpdate((dinero - apuesta) + (apuesta * 5 * multiplyPoker));
      setShouldAnimate(true);
    } else if (newReel[0] === newReel[1] || newReel[1] === newReel[2] || newReel[0] === newReel[2]) {
      setGanancia(apuesta * 2 * multiplyPoker);
      setMessage("par");
      moneyUpdate((dinero - apuesta) + (apuesta * 2 * multiplyPoker));
      setShouldAnimate(true);
    } else {
      setGanancia(0);
      setMessage("perdiste");
      moneyUpdate(dinero - apuesta);
      setShouldAnimate(false);
    }
  }

  function moneyUpdate(valor) {
    setDinero(valor);
    if (valor <= 0) {
      alert("Game Over");
      navigate('/gameover');
    }
  }

  return (
    <>
      {/* 🔈 Botón de Mute/Unmute */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 999 }}>
        <button onClick={toggleMute} style={{ fontSize: '24px', padding: '4px 8px', cursor: 'pointer' }}>
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      <p className='resultado'>{message || "SPIN ..."}</p>
      <div className="casino">
        <p className='dinero'>Dinero: {dinero}</p>
        <div className="slot-container">
          <SlotColumn
            items={allReel}
            finalIndex={finalIndex1}
            isSpinning={isSpinningSlot1}
            onFinish={() => {
              setReels(prev => [allReel[finalIndex1], prev[1], prev[2]]);
              setIsSpinningSlot1(false);
              setIsSpinningSlot2(true);
            }}
          />
          <SlotColumn
            items={allReel}
            finalIndex={finalIndex2}
            isSpinning={isSpinningSlot2}
            onFinish={() => {
              setReels(prev => [prev[0], allReel[finalIndex2], prev[2]]);
              setIsSpinningSlot2(false);
              setIsSpinningSlot3(true);
            }}
          />
          <SlotColumn
            items={allReel}
            finalIndex={finalIndex3}
            isSpinning={isSpinningSlot3}
            onFinish={() => {
              const newReel = [allReel[finalIndex1], allReel[finalIndex2], allReel[finalIndex3]];
              setReels(newReel);
              setIsSpinningSlot3(false);
              winOrLose(newReel);
            }}
          />
        </div>
        <button className="spin" onClick={slotSpin} disabled={isSpinningSlot1 || isSpinningSlot2 || isSpinningSlot3}>
          SPIN
        </button>
      </div>
      <div className="historial">
        <p className={`ganancia ${shouldAnimate ? 'animate' : ''}`}>
          +{ganancia}
        </p>
      </div>
    </>
  );
}

export default Casino;
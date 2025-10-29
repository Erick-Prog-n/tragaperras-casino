import React, { useState, useEffect } from 'react';
import SlotColumn from './SlotColumn';
import styles from './SlotColumn.module.css';

// Componente reutilizable para cada máquina tragamonedas
// Permite tener múltiples máquinas independientes
function SlotMachine({ id, allReel, dinero, setDinero, apuesta, spinSoundRef, isAutoSpinning, onJackpot }) {
  const [reels, setReels] = useState([allReel[0], allReel[1], allReel[2]]);
  const [message, setMessage] = useState('');
  const [ganancia, setGanancia] = useState(0);
  const [isSpinningSlot1, setIsSpinningSlot1] = useState(false);
  const [isSpinningSlot2, setIsSpinningSlot2] = useState(false);
  const [isSpinningSlot3, setIsSpinningSlot3] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [finalIndex1, setFinalIndex1] = useState(0);
  const [finalIndex2, setFinalIndex2] = useState(0);
  const [finalIndex3, setFinalIndex3] = useState(0);

  useEffect(() => {
    if (shouldAnimate) {
      const timer = setTimeout(() => setShouldAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shouldAnimate]);

  // Efecto para auto spin cuando isAutoSpinning está activo
  useEffect(() => {
    let interval;
    if (isAutoSpinning && !isSpinningSlot1 && !isSpinningSlot2 && !isSpinningSlot3) {
      interval = setInterval(() => {
        slotSpin();
      }, 500); // Spin every 0.5 seconds when auto spinning
    }
    return () => clearInterval(interval);
  }, [isAutoSpinning, isSpinningSlot1, isSpinningSlot2, isSpinningSlot3]);

  function slotSpin() {
    if (isSpinningSlot1 || isSpinningSlot2 || isSpinningSlot3) return;

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
      const jackpotAmount = apuesta * 5000 * multiplyPoker;
      setGanancia(jackpotAmount);
      setMessage("jackpot");

      // Si son 3 pokers (jackpot máximo), notificar al componente padre
      if (isPokerMatch === 3) {
        onJackpot(jackpotAmount, id);
      }

      setDinero(prev => prev - apuesta + jackpotAmount);
      setShouldAnimate(true);
    } else if (newReel[0] === newReel[1] || newReel[1] === newReel[2] || newReel[0] === newReel[2]) {
      setGanancia(apuesta * 1000 * multiplyPoker);
      setMessage("par");
      setDinero(prev => prev - apuesta + (apuesta * 1000 * multiplyPoker));
      setShouldAnimate(true);
    } else {
      setGanancia(0);
      setMessage("perdiste");
      setDinero(prev => prev - apuesta);
      setShouldAnimate(false);
    }
  }

  return (
    <div>
      <p className={styles.resultado}>{message || "SPIN ..."}</p>
      <div className={styles.casino}>
        <div className={styles.slotorder}>
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
        <button className={styles.spinbuton} onClick={slotSpin} disabled={isSpinningSlot1 || isSpinningSlot2 || isSpinningSlot3}>
          SPIN
        </button>
      </div>
      <div className="historial">
        <p className={`${styles.ganancia} ${shouldAnimate ? 'animate' : ''}`} style={{ fontSize: ganancia <= 20 ? '1.5rem' : ganancia <= 100 ? '3rem' : ganancia <= 500 ? '4rem' : '5rem', color: '#FFD700' }}>
          +{ganancia}
        </p>
      </div>
    </div>
  );
}

export default SlotMachine;
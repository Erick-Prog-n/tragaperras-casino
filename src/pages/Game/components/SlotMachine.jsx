import React, { useState, useEffect } from 'react';
import SlotColumn from './SlotColumn';
import styles from './SlotColumn.module.css';

// Componente reutilizable para cada máquina tragamonedas
// Permite tener múltiples máquinas independientes
function SlotMachine({ id, allReel, dinero, setDinero, apuesta, spinSoundRef, isCoordinatedAutoSpin, spinRound, onJackpot, onWinnings, onMachineFinished, onSellMachine, globalUpgradeLevel, onUpdateHighRiskCount, initialHighRisk, onUpdateMachineHighRisk, onStopAutoSpin }) {
  const [reels, setReels] = useState([allReel[0], allReel[1], allReel[2]]);
  const [message, setMessage] = useState('');
  const [isSpinningSlot1, setIsSpinningSlot1] = useState(false);
  const [isSpinningSlot2, setIsSpinningSlot2] = useState(false);
  const [isSpinningSlot3, setIsSpinningSlot3] = useState(false);
  const [finalIndex1, setFinalIndex1] = useState(0);
  const [finalIndex2, setFinalIndex2] = useState(0);
  const [finalIndex3, setFinalIndex3] = useState(0);
  const [isPoweredOn, setIsPoweredOn] = useState(true);
  const [isHighRisk, setIsHighRisk] = useState(initialHighRisk);
  const [isJackpotHighRisk, setIsJackpotHighRisk] = useState(false);


  // Efecto para autospin coordinado
  useEffect(() => {
    if (isCoordinatedAutoSpin && spinRound > 0 && !isSpinningSlot1 && !isSpinningSlot2 && !isSpinningSlot3 && isPoweredOn) {
      // Pequeño delay para asegurar que todas las máquinas estén listas
      const timeout = setTimeout(() => {
        slotSpin();
      }, id * 50); // Delay basado en el ID para evitar colisiones de audio
      return () => clearTimeout(timeout);
    }
  }, [spinRound, isCoordinatedAutoSpin, isSpinningSlot1, isSpinningSlot2, isSpinningSlot3, id, isPoweredOn]);

  function slotSpin() {
    if (isSpinningSlot1 || isSpinningSlot2 || isSpinningSlot3 || !isPoweredOn) return;

    const spinSound = spinSoundRef.current;
    spinSound.currentTime = 0;
    spinSound.volume = 0.3;
    spinSound.play().catch(console.error);

    if (isHighRisk) {
      // Modo alto riesgo: decidir resultado
      const jackpot = Math.random() < 0.1;
      setIsJackpotHighRisk(jackpot);
      if (jackpot) {
        // Forzar pokerchips
        const pokerChipIndex = allReel.length - 1;
        setFinalIndex1(pokerChipIndex);
        setFinalIndex2(pokerChipIndex);
        setFinalIndex3(pokerChipIndex);
      } else {
        // Símbolos aleatorios
        const f1 = Math.floor(Math.random() * allReel.length);
        const f2 = Math.floor(Math.random() * allReel.length);
        const f3 = Math.floor(Math.random() * allReel.length);
        setFinalIndex1(f1);
        setFinalIndex2(f2);
        setFinalIndex3(f3);
      }
    } else {
      // Modo normal
      const f1 = Math.floor(Math.random() * allReel.length);
      const f2 = Math.floor(Math.random() * allReel.length);
      const f3 = Math.floor(Math.random() * allReel.length);
      setFinalIndex1(f1);
      setFinalIndex2(f2);
      setFinalIndex3(f3);
    }

    setMessage("SPIN...");
    setIsSpinningSlot1(true);
  }

  function togglePower() {
    setIsPoweredOn(prev => !prev);
  }

  function toggleHighRisk() {
    setIsHighRisk(prev => {
      const newState = !prev;
      onUpdateHighRiskCount(newState ? 1 : -1);
      onUpdateMachineHighRisk(id, newState);
      return newState;
    });
  }

  function winOrLose(newReel) {
    const isPokerMatch = newReel.filter(item => item.isPoker).length;

    if (isHighRisk) {
      // Modo alto riesgo: resultado ya decidido en slotSpin
      if (isJackpotHighRisk) {
        // Detener autospin
        onStopAutoSpin();
        const winAmount = apuesta * 1000 + 100 * globalUpgradeLevel;
        setMessage("jackpot");

        onJackpot(winAmount, id);

        setDinero(prev => {
          const newValue = prev - apuesta + winAmount;
          if (newValue <= 0) {
            window.location.href = '/gameover';
          }
          return newValue;
        });
        if (isCoordinatedAutoSpin) {
          onMachineFinished(winAmount);
        } else {
          onWinnings(winAmount);
        }
      } else {
        // Perder: restar la mitad del saldo total
        setMessage("perdiste (alto riesgo)");
        setDinero(prev => {
          const loss = Math.floor(prev / 2);
          const newValue = prev - loss;
          if (newValue <= 0) {
            window.location.href = '/gameover';
          }
          return newValue;
        });
        if (isCoordinatedAutoSpin) {
          onMachineFinished(0);
        }
      }
    } else {
      // Modo normal
      if (newReel[0] === newReel[1] && newReel[1] === newReel[2]) {
        // Triple (jackpot)
        let multiplier = 2; // Triple normal reducido
        if (isPokerMatch === 3) {
          multiplier = 1000; // Triple poker queda exagerado
        }

        let winAmount = apuesta * multiplier + 100 * globalUpgradeLevel;
        setMessage("jackpot");

        // Si son 3 pokers (jackpot máximo), notificar al componente padre
        if (isPokerMatch === 3) {
          onJackpot(winAmount, id);
        }

        setDinero(prev => {
          const newValue = prev - apuesta + winAmount;
          if (newValue <= 0) {
            // Navigate to game over if balance reaches 0 or below
            window.location.href = '/gameover';
          }
          return newValue;
        });
        if (isCoordinatedAutoSpin) {
          onMachineFinished(winAmount);
        } else {
          onWinnings(winAmount);
        }
      } else if (newReel[0] === newReel[1] || newReel[1] === newReel[2] || newReel[0] === newReel[2]) {
        // Par
        let multiplier = 1.5; // Par normal reducido
        if (isPokerMatch === 2) {
          multiplier = 5; // Par de poker reducido
        }

        let winAmount = apuesta * multiplier + 100 * globalUpgradeLevel;
        setMessage("par");
        setDinero(prev => {
          const newValue = prev - apuesta + winAmount;
          if (newValue <= 0) {
            window.location.href = '/gameover';
          }
          return newValue;
        });
        if (isCoordinatedAutoSpin) {
          onMachineFinished(winAmount);
        } else {
          onWinnings(winAmount);
        }
      } else {
        setMessage("perdiste");
        setDinero(prev => {
          const newValue = prev - apuesta;
          if (newValue <= 0) {
            window.location.href = '/gameover';
          }
          return newValue;
        });
        // Reportar 0 ganancias para pérdidas en modo coordinado
        if (isCoordinatedAutoSpin) {
          onMachineFinished(0);
        }
      }
    }
  }

  return (
    <div>
      {/* Botones de control de la máquina */}
      <div style={{
        display: 'flex',
        gap: '5px',
        justifyContent: 'center',
        marginBottom: '10px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => onSellMachine(id)}
          style={{
            padding: '4px 8px',
            fontSize: '16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
          title="Vender máquina por 50 monedas"
        >
          💰
        </button>

        <button
          onClick={toggleHighRisk}
          style={{
            padding: '4px 8px',
            fontSize: '16px',
            backgroundColor: isHighRisk ? '#ffc107' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
          title={isHighRisk ? "Desactivar modo alto riesgo" : "Activar modo alto riesgo"}
        >
          💀
        </button>

        <button
          onClick={togglePower}
          style={{
            padding: '4px 8px',
            fontSize: '16px',
            backgroundColor: isPoweredOn ? '#6c757d' : '#343a40',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
          title={isPoweredOn ? "Apagar máquina" : "Encender máquina"}
        >
          {isPoweredOn ? '🔌' : '⚡'}
        </button>
      </div>

      <p className={styles.resultado}>{message || "SPIN ..."}</p>
      <div className={styles.casino} style={{
        opacity: isPoweredOn ? 1 : 0.6,
        filter: isPoweredOn ? 'none' : 'grayscale(30%) brightness(0.8)'
      }}>
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
        <button
          className={styles.spinbuton}
          onClick={slotSpin}
          disabled={isSpinningSlot1 || isSpinningSlot2 || isSpinningSlot3 || !isPoweredOn}
          style={{
            opacity: isPoweredOn ? 1 : 0.5,
            filter: isPoweredOn ? 'none' : 'grayscale(50%)'
          }}
        >
          SPIN
        </button>
      </div>
    </div>
  );
}

export default SlotMachine;
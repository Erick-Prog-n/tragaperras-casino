import React, { useState, useEffect, useRef } from 'react';
import {
  PiNumberCircleEight, PiNumberCircleFive, PiNumberCircleFour,
  PiNumberCircleNine, PiNumberCircleOne, PiNumberCircleSeven,
  PiNumberCircleSix, PiNumberCircleThree, PiNumberCircleTwo,
  PiNumberCircleZero, PiPokerChip
} from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import SlotMachine from './components/SlotMachine';
import CustomOffcanvas from './components/Offcanvas';
import TutorialOffcanvas from './components/TutorialOffcanvas';
import { Lowbar } from './components/LowBar';

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
  // No longer needed since save point is consumable

  const hasSavePoint = true; // Guardado automático activado

  const [dinero, setDinero] = useState(() => {
    if (hasSavePoint) {
      const saved = localStorage.getItem('casinoDinero');
      return saved ? parseInt(saved, 10) : 1000;
    }
    return 1000;
  });
  const [apuesta, setApuesta] = useState(100);
  const navigate = useNavigate();

  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  // Estado para el número de máquinas
  const [numMachines, setNumMachines] = useState(() => {
    if (hasSavePoint) {
      const saved = localStorage.getItem('numMachines');
      return saved ? parseInt(saved, 10) : 1;
    }
    return 1;
  });

  // Estado para mostrar el overlay de jackpot
  const [jackpotOverlay, setJackpotOverlay] = useState(null); // {amount: number, machineId: number} or null

  // Estado para las ganancias totales de todas las máquinas
  const [totalGanancia, setTotalGanancia] = useState(0);
  const [shouldAnimateTotal, setShouldAnimateTotal] = useState(false);

  // Estado para controlar autospin coordinado
  const [isCoordinatedAutoSpin, setIsCoordinatedAutoSpin] = useState(false);
  const [roundWinnings, setRoundWinnings] = useState(0);
  const [machinesFinished, setMachinesFinished] = useState(0);
  const [spinRound, setSpinRound] = useState(0);

  // Estado para controlar el offcanvas de la tienda
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  // Estado para controlar el offcanvas del tutorial
  const [showTutorialOffcanvas, setShowTutorialOffcanvas] = useState(false);

  // Estado para la mejora global (nivel)
  const [globalUpgradeLevel, setGlobalUpgradeLevel] = useState(() => {
    if (hasSavePoint) {
      const saved = localStorage.getItem('globalUpgradeLevel');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  // Estado para saber si se compró el punto de guardado
  const [hasBoughtSavePoint, setHasBoughtSavePoint] = useState(() => localStorage.getItem('hasBoughtSavePoint') === 'true');

  // Estado para contar máquinas con modo alto riesgo
  const [highRiskCount, setHighRiskCount] = useState(0);

  // Estado para mejoras individuales por máquina
  const [machineHighRisk, setMachineHighRisk] = useState(() => {
    if (hasSavePoint) {
      const saved = localStorage.getItem('machineHighRisk');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const spinSoundRef = useRef(new Audio('/sounds/spin_sound.mp3'));
  const winSoundRef = useRef(new Audio('/sounds/win_sound.mp3'));
  const loseSoundRef = useRef(new Audio('/sounds/lose_sound.mp3'));
  const bgAudioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  // Guardado automático en localStorage
  useEffect(() => {
    localStorage.setItem('casinoDinero', dinero.toString());
  }, [dinero]);

  useEffect(() => {
    localStorage.setItem('numMachines', numMachines.toString());
  }, [numMachines]);

  useEffect(() => {
    localStorage.setItem('globalUpgradeLevel', globalUpgradeLevel.toString());
  }, [globalUpgradeLevel]);

  useEffect(() => {
    localStorage.setItem('machineHighRisk', JSON.stringify(machineHighRisk));
  }, [machineHighRisk]);

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
    const spinSound = spinSoundRef.current;
    const winSound = winSoundRef.current;
    const loseSound = loseSoundRef.current;

    if (bgAudio) {
      bgAudio.muted = isMuted;
      if (!isMuted) {
        bgAudio.play().catch(err => console.warn("AutoPlay blockeado"));
      } else {
        bgAudio.pause();
      }
    }

    // Mute all sound effects
    spinSound.muted = isMuted;
    winSound.muted = isMuted;
    loseSound.muted = isMuted;
  }, [isMuted]);

  function toggleMute() {
    setIsMuted(prev => !prev);
  }

  // El auto spin ahora se maneja individualmente en cada SlotMachine component

  function startAutoSpin() {
    setIsCoordinatedAutoSpin(true);
    setSpinRound(1); // Iniciar con ronda 1
  }

  function stopAutoSpin() {
    setIsCoordinatedAutoSpin(false);
    setSpinRound(0);
  }

  // Función para realizar un spin coordinado de todas las máquinas
  function performCoordinatedSpin() {
    if (!isCoordinatedAutoSpin) return;

    // Resetear contadores para esta ronda
    setRoundWinnings(0);
    setMachinesFinished(0);

    // Incrementar el contador de rondas para que todas las máquinas giren
    setSpinRound(prev => prev + 1);
  }

  // Función para manejar cuando una máquina termina su spin
  function handleMachineFinished(winnings) {
    setRoundWinnings(prev => prev + winnings);
    setMachinesFinished(prev => {
      const newCount = prev + 1;
      // Si todas las máquinas han terminado
      if (newCount >= numMachines) {
        // Mostrar las ganancias totales de la ronda
        setRoundWinnings(currentRoundWinnings => {
          if (currentRoundWinnings > 0) {
            setTotalGanancia(currentRoundWinnings);
            setShouldAnimateTotal(true);
            setTimeout(() => setShouldAnimateTotal(false), 2000);
          }

          // Si el autospin coordinado sigue activo, programar la siguiente ronda
          if (isCoordinatedAutoSpin) {
            setTimeout(() => performCoordinatedSpin(), 1000); // Esperar 1 segundo antes de la siguiente ronda
          }

          return 0; // Resetear para la siguiente ronda
        });
      }
      return newCount;
    });
  }

  // Función para manejar cuando se gana un jackpot (3 pokers)
  function handleJackpot(amount, machineId) {
    // Detener todas las máquinas
    setIsAutoSpinning(false);

    // Mostrar el overlay de jackpot
    setJackpotOverlay({ amount, machineId });

    // Ocultar el overlay después de 5 segundos
    setTimeout(() => {
      setJackpotOverlay(null);
    }, 5000);
  }

  // Función para probar la animación de jackpot (para testing)
  function testJackpot() {
    const testAmount = 1000000; // 1 millón para testing
    const randomMachine = Math.floor(Math.random() * numMachines) + 1; // Máquina aleatoria
    handleJackpot(testAmount, randomMachine);
  }

  // Función para resetear el juego al estado inicial
  function resetGame() {
    // Confirmar antes de resetear
    if (window.confirm('¿Estás seguro de que quieres resetear el juego? Perderás todo tu progreso.')) {
      // Resetear dinero a 1000
      setDinero(1000);
      localStorage.setItem('casinoDinero', '1000');

      // Resetear número de máquinas a 1
      setNumMachines(1);
      localStorage.setItem('numMachines', '1');

      // Detener auto spin si está activo
      setIsAutoSpinning(false);

      // Ocultar cualquier jackpot overlay
      setJackpotOverlay(null);

      // Resetear apuesta a 100
      setApuesta(100);

      // Resetear mejora global
      setGlobalUpgradeLevel(0);

      // Limpiar cualquier otro dato del localStorage relacionado con el juego
      localStorage.removeItem('hasSecondMachine'); // Por si acaso queda algún residuo
      localStorage.removeItem('hasSavePoint'); // Reset save point status
      localStorage.setItem('globalUpgradeLevel', '0'); // Reset global upgrade

      alert('Juego reseteado exitosamente. ¡Buena suerte!');
    }
  }

  // Función para establecer el saldo a 1,000,000
  function becomeMillionaire() {
    setDinero(1000000);
    localStorage.setItem('casinoDinero', '1000000');
    alert('¡Felicidades! Ahora tienes 1,000,000 de monedas. ¡Disfruta tu fortuna!');
  }

  // Función para establecer el saldo a 100
  function setMoneyTo100() {
    setDinero(100);
    localStorage.setItem('casinoDinero', '100');
    alert('Saldo establecido a 100 monedas.');
  }

  // Función para comprar una nueva máquina
  // Permite compras ilimitadas mientras haya dinero suficiente
  function buyMachine() {
    if (dinero >= 100) {
      setDinero(dinero - 100);
      setNumMachines(prev => prev + 1);
      // No automatic saving - only when save point is purchased
    } else {
      alert("No tienes suficiente dinero para comprar una máquina.");
    }
  }

  // Función para vender una máquina
  function sellMachine(machineId) {
    if (numMachines > 1) {
      setDinero(prev => prev + 50);
      setNumMachines(prev => prev - 1);
      alert(`Máquina ${machineId} vendida por 50 monedas.`);
    } else {
      alert("No puedes vender la última máquina.");
    }
  }

  // Función para actualizar el contador de máquinas con alto riesgo
  function updateHighRiskCount(delta) {
    setHighRiskCount(prev => prev + delta);
  }

  // Función para actualizar mejoras individuales por máquina
  function updateMachineHighRisk(id, isActive) {
    setMachineHighRisk(prev => {
      const newArr = [...prev];
      newArr[id - 1] = isActive;
      return newArr;
    });
  }

  // Función para calcular el costo del punto de guardado basado en el dinero actual
  function getSavePointCost() {
    if (dinero <= 500) return 100;
    if (dinero <= 2000) return 200;
    if (dinero <= 5000) return 500;
    if (dinero <= 10000) return 1000;
    return 2000;
  }

  // Función para comprar el punto de guardado
  function buySavePoint() {
    const cost = getSavePointCost();
    if (dinero >= cost) {
      setDinero(dinero - cost);
      // Guardar snapshot del estado actual justo después de gastar
      const snapshot = {
        dinero: dinero - cost,
        numMachines,
        globalUpgradeLevel,
        machineHighRisk: [...machineHighRisk],
        timestamp: Date.now()
      };
      localStorage.setItem('savePointSnapshot', JSON.stringify(snapshot));
      setHasBoughtSavePoint(true);
      localStorage.setItem('hasBoughtSavePoint', 'true');
      alert("¡Punto de guardado creado! Puedes volver a este punto con el botón de reloj.");
    } else {
      alert(`No tienes suficiente dinero para comprar el punto de guardado. (Costo: ${cost} monedas)`);
    }
  }

  // Función para cargar el punto de guardado
  function loadSavePoint() {
    if (!hasBoughtSavePoint) {
      alert("No has comprado la mejora de punto de guardado.");
      return;
    }
    const snapshot = localStorage.getItem('savePointSnapshot');
    if (snapshot) {
      const data = JSON.parse(snapshot);
      setDinero(data.dinero);
      setNumMachines(data.numMachines);
      setGlobalUpgradeLevel(data.globalUpgradeLevel);
      setMachineHighRisk(data.machineHighRisk);
      setHasBoughtSavePoint(false);
      localStorage.setItem('hasBoughtSavePoint', 'false');
      alert("¡Vuelto al punto de guardado! El juego continúa desde ese momento. La mejora se ha consumido.");
    } else {
      alert("No hay un punto de guardado disponible.");
    }
  }

  // Función para comprar la mejora global
  function buyGlobalUpgrade() {
    const cost = 1000 * Math.pow(2, globalUpgradeLevel);
    if (dinero >= cost) {
      setDinero(dinero - cost);
      setApuesta(prev => prev + 50);
      setGlobalUpgradeLevel(prev => prev + 1);
      localStorage.setItem('globalUpgradeLevel', (globalUpgradeLevel + 1).toString());
      alert(`¡Mejora global nivel ${globalUpgradeLevel + 1} activada! Todas las máquinas ganan +100 extra y la apuesta aumenta en 50.`);
    } else {
      alert(`No tienes suficiente dinero para comprar la mejora global. (Costo: ${cost} monedas)`);
    }
  }

  function updateMoney(newValue) {
    setDinero(newValue);
    // No automatic saving - only when save point is purchased
    if (newValue <= 0) {
      // Reset global upgrade on game over
      setGlobalUpgradeLevel(0);
      localStorage.setItem('globalUpgradeLevel', '0');
      alert("Game Over");
      navigate('/gameover');
    } else if (newValue <= 1000 && highRiskCount > 0 && isCoordinatedAutoSpin) {
      // Detener autospin y esperar 2 segundos
      stopAutoSpin();
      setTimeout(() => {
        if (dinero > 1000) {
          // Reanudar autospin si se superó 1000
          startAutoSpin();
        } else {
          // Game over si no se superó
          setGlobalUpgradeLevel(0);
          localStorage.setItem('globalUpgradeLevel', '0');
          alert("Game Over");
          navigate('/gameover');
        }
      }, 2000);
    }
  }

  // Función para manejar las ganancias de cada máquina (modo normal)
  function handleMachineWinnings(amount) {
    if (!isCoordinatedAutoSpin && amount > 0) {
      setTotalGanancia(amount);
      setShouldAnimateTotal(true);
      // Reset animation after 2 seconds
      setTimeout(() => setShouldAnimateTotal(false), 2000);
    }
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* 🔈 Botón de Mute/Unmute, 🎰 Test Jackpot, 💰 Millionaire, 💵 Set to 100 y 🔄 Reset Game */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 999, display: 'flex', gap: '10px' }}>
        <button onClick={toggleMute} style={{ fontSize: '24px', padding: '4px 8px', cursor: 'pointer' }}>
          {isMuted ? '🔇' : '🔊'}
        </button>
        <button onClick={testJackpot} style={{ fontSize: '24px', padding: '4px 8px', cursor: 'pointer' }} title="Probar Jackpot">
          🎰
        </button>
        <button onClick={becomeMillionaire} style={{ fontSize: '24px', padding: '4px 8px', cursor: 'pointer' }} title="Convertirse en Millonario">
          💰
        </button>
        <button onClick={setMoneyTo100} style={{ fontSize: '24px', padding: '4px 8px', cursor: 'pointer' }} title="Establecer saldo a 100">
          💵
        </button>
        <button onClick={resetGame} style={{ fontSize: '24px', padding: '4px 8px', cursor: 'pointer' }} title="Resetear Juego">
          🔄
        </button>
      </div>


      {/* Botones en el borde izquierdo de la página */}
      <div style={{ position: 'fixed', top: '40%', left: 0, zIndex: 999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={() => setShowTutorialOffcanvas(true)}
          style={{
            fontSize: '24px',
            padding: '8px 12px',
            cursor: 'pointer',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '0 4px 4px 0',
            boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            marginLeft: '5px'
          }}
          title="Abrir Tutorial"
        >
          ❓
        </button>
      </div>


      <CustomOffcanvas
        onBuyMachine={buyMachine}
        onBuySavePoint={buySavePoint}
        onBuyGlobalUpgrade={buyGlobalUpgrade}
        numMachines={numMachines}
        globalUpgradeLevel={globalUpgradeLevel}
        dinero={dinero}
        show={showOffcanvas}
        onShow={() => setShowOffcanvas(true)}
        onHide={() => setShowOffcanvas(false)}
      />

      <TutorialOffcanvas
        show={showTutorialOffcanvas}
        onHide={() => setShowTutorialOffcanvas(false)}
      />

      {/* Contenedor principal del juego */}
      <div style={{
        paddingTop: '100px', // Espacio para el display de ganancias
        paddingBottom: '40px',
        minHeight: 'calc(100vh - 200px)'
      }}>
        {/* Grid de 4x4 para organizar las máquinas tragamonedas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          justifyItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 40px' // Márgenes laterales más amplios
        }}>
          {/* Renderiza dinámicamente el número de máquinas basado en numMachines */}
          {Array.from({ length: numMachines }, (_, i) => (
            <SlotMachine
              key={i + 1}
              id={i + 1}
              allReel={allReel}
              dinero={dinero}
              setDinero={setDinero}
              apuesta={apuesta}
              spinSoundRef={spinSoundRef}
              winSoundRef={winSoundRef}
              loseSoundRef={loseSoundRef}
              isCoordinatedAutoSpin={isCoordinatedAutoSpin}
              spinRound={spinRound}
              onJackpot={handleJackpot}
              onWinnings={handleMachineWinnings}
              onMachineFinished={handleMachineFinished}
              onSellMachine={sellMachine}
              globalUpgradeLevel={globalUpgradeLevel}
              onUpdateHighRiskCount={updateHighRiskCount}
              initialHighRisk={machineHighRisk[i] || false}
              onUpdateMachineHighRisk={updateMachineHighRisk}
              onStopAutoSpin={stopAutoSpin}
            />
          ))}
        </div>

        {/* Barra inferior */}
        <div style={{ marginTop: '60px' }}>
          <Lowbar dinero={dinero} onSpin={() => {}} onStartAutoSpin={startAutoSpin} onStopAutoSpin={stopAutoSpin} onOpenTienda={() => setShowOffcanvas(true)} onLoadSavePoint={loadSavePoint} hasBoughtSavePoint={hasBoughtSavePoint}/>
        </div>
      </div>

      {/* Overlay de Jackpot - aparece cuando se gana el premio mayor */}
      {jackpotOverlay && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          animation: 'jackpotFlash 0.5s ease-in-out infinite alternate'
        }}>
          <div style={{
            textAlign: 'center',
            color: '#FFD700',
            fontSize: '8rem',
            fontWeight: 'bold',
            textShadow: '0 0 20px #FFD700, 0 0 40px #FFD700, 0 0 60px #FFD700',
            animation: 'jackpotPulse 2s ease-in-out infinite'
          }}>
            JACKPOT!<br/>
            <span style={{ fontSize: '4rem', color: '#FFFFFF' }}>
              +{jackpotOverlay.amount.toLocaleString()} MONEDAS
            </span><br/>
            <span style={{ fontSize: '2rem', color: '#FFD700' }}>
              Máquina #{jackpotOverlay.machineId}
            </span>
          </div>
        </div>
      )}

      {/* Estilos CSS para las animaciones del jackpot */}
      <style jsx>{`
        @keyframes jackpotFlash {
          0% { background-color: rgba(0, 0, 0, 0.8); }
          100% { background-color: rgba(255, 215, 0, 0.3); }
        }
        @keyframes jackpotPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default Casino;

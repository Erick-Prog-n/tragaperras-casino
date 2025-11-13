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

  const [dinero, setDinero] = useState(() => {
    const saved = localStorage.getItem('casinoDinero');
    return saved ? parseInt(saved, 10) : 200;
  });
  const [apuesta, setApuesta] = useState(100);
  const navigate = useNavigate();

  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  // Estado para el número de máquinas
  const [numMachines, setNumMachines] = useState(() => {
    const saved = localStorage.getItem('numMachines');
    return saved ? parseInt(saved, 10) : 1;
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
      // Resetear dinero a 200
      setDinero(200);
      localStorage.setItem('casinoDinero', '200');

      // Resetear número de máquinas a 1
      setNumMachines(1);
      localStorage.setItem('numMachines', '1');

      // Detener auto spin si está activo
      setIsAutoSpinning(false);

      // Ocultar cualquier jackpot overlay
      setJackpotOverlay(null);

      // Resetear apuesta a 100
      setApuesta(100);

      // Limpiar cualquier otro dato del localStorage relacionado con el juego
      localStorage.removeItem('hasSecondMachine'); // Por si acaso queda algún residuo
      localStorage.removeItem('hasSavePoint'); // Reset save point status

      alert('Juego reseteado exitosamente. ¡Buena suerte!');
    }
  }

  // Función para establecer el saldo a 1,000,000
  function becomeMillionaire() {
    setDinero(1000000);
    localStorage.setItem('casinoDinero', '1000000');
    alert('¡Felicidades! Ahora tienes 1,000,000 de monedas. ¡Disfruta tu fortuna!');
  }

  // Función para comprar una nueva máquina
  // Permite compras ilimitadas mientras haya dinero suficiente
  function buyMachine() {
    if (dinero >= 50) {
      setDinero(dinero - 50);
      setNumMachines(prev => prev + 1);
      // No automatic saving - only when save point is purchased
    } else {
      alert("No tienes suficiente dinero para comprar una máquina.");
    }
  }

  // Función para comprar el punto de guardado
  function buySavePoint() {
    if (dinero >= 100) {
      setDinero(dinero - 100);
      // Guardar el estado actual (antes de restar el costo)
      localStorage.setItem('casinoDinero', (dinero - 100).toString());
      localStorage.setItem('numMachines', numMachines.toString());
      localStorage.setItem('hasSavePoint', 'true');
      alert("¡Punto de guardado activado! Tu progreso actual ha sido guardado.");
    } else {
      alert("No tienes suficiente dinero para comprar el punto de guardado. (Costo: 100 monedas)");
    }
  }

  function updateMoney(newValue) {
    setDinero(newValue);
    // No automatic saving - only when save point is purchased
    if (newValue <= 0) {
      alert("Game Over");
      navigate('/gameover');
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
      {/* 🔈 Botón de Mute/Unmute, 🎰 Test Jackpot, 💰 Millionaire y 🔄 Reset Game */}
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
        <button onClick={resetGame} style={{ fontSize: '24px', padding: '4px 8px', cursor: 'pointer' }} title="Resetear Juego">
          🔄
        </button>
      </div>

      {/* Botón de Tienda en el borde izquierdo de la página */}
      <div style={{ position: 'fixed', top: '50%', left: 0, transform: 'translateY(-50%)', zIndex: 999 }}>
        <button
          onClick={() => setShowOffcanvas(true)}
          style={{
            fontSize: '24px',
            padding: '8px 12px',
            cursor: 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '0 4px 4px 0',
            boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            marginLeft: '5px'
          }}
          title="Abrir Tienda"
        >
          Tienda
        </button>
      </div>

      {/* Display total winnings at top center */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2000,
        textAlign: 'center',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        pointerEvents: 'none' // Para que no interfiera con clics
      }}>
        <p className={`ganancia ${shouldAnimateTotal ? 'animate' : ''}`} style={{
          fontSize: totalGanancia <= 20 ? '1.5rem' : totalGanancia <= 100 ? '3rem' : totalGanancia <= 500 ? '4rem' : '5rem',
          color: '#FFD700',
          margin: 0
        }}>
          +{totalGanancia}
        </p>
      </div>

      <CustomOffcanvas
        onBuyMachine={buyMachine}
        onBuySavePoint={buySavePoint}
        numMachines={numMachines}
        show={showOffcanvas}
        onShow={() => setShowOffcanvas(true)}
        onHide={() => setShowOffcanvas(false)}
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
              isCoordinatedAutoSpin={isCoordinatedAutoSpin}
              spinRound={spinRound}
              onJackpot={handleJackpot}
              onWinnings={handleMachineWinnings}
              onMachineFinished={handleMachineFinished}
            />
          ))}
        </div>

        {/* Barra inferior */}
        <div style={{ marginTop: '60px' }}>
          <Lowbar dinero={dinero} onSpin={() => {}} onStartAutoSpin={startAutoSpin} onStopAutoSpin={stopAutoSpin}/>
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

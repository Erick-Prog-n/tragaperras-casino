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
  const [dinero, setDinero] = useState(() => {
    const saved = localStorage.getItem('casinoDinero');
    return saved ? parseInt(saved, 10) : 100;
  });
  const [apuesta, setApuesta] = useState(10);
  const navigate = useNavigate();

  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  // Estado para el número de máquinas, persistido en localStorage
  // Permite comprar múltiples máquinas sin límite (excepto dinero)
  const [numMachines, setNumMachines] = useState(() => {
    const saved = localStorage.getItem('numMachines');
    return saved ? parseInt(saved, 10) : 1;
  });

  // Efecto para guardar el número de máquinas en localStorage cada vez que cambia
  useEffect(() => {
    localStorage.setItem('numMachines', numMachines.toString());
  }, [numMachines]);

  // Estado para mostrar el overlay de jackpot
  const [jackpotOverlay, setJackpotOverlay] = useState(null); // {amount: number, machineId: number} or null

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
    setIsAutoSpinning(true);
  }

  function stopAutoSpin() {
    setIsAutoSpinning(false);
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
      // Resetear dinero a 100
      setDinero(100);
      localStorage.setItem('casinoDinero', '100');

      // Resetear número de máquinas a 1
      setNumMachines(1);
      localStorage.setItem('numMachines', '1');

      // Detener auto spin si está activo
      setIsAutoSpinning(false);

      // Ocultar cualquier jackpot overlay
      setJackpotOverlay(null);

      // Resetear apuesta a 10
      setApuesta(10);

      // Limpiar cualquier otro dato del localStorage relacionado con el juego
      localStorage.removeItem('hasSecondMachine'); // Por si acaso queda algún residuo

      alert('Juego reseteado exitosamente. ¡Buena suerte!');
    }
  }

  // Función para comprar una nueva máquina
  // Permite compras ilimitadas mientras haya dinero suficiente
  function buyMachine() {
    if (dinero >= 50) {
      setDinero(dinero - 50);
      setNumMachines(prev => prev + 1);
      // Nota: El localStorage se actualiza automáticamente por el useEffect
    } else {
      alert("No tienes suficiente dinero para comprar una máquina.");
    }
  }

  function moneyUpdate(valor) {
    setDinero(valor);
    localStorage.setItem('casinoDinero', valor.toString());
    if (valor <= 0) {
      alert("Game Over");
      navigate('/gameover');
    }
  }

  return (
    <>
      {/* 🔈 Botón de Mute/Unmute, 🎰 Test Jackpot y 🔄 Reset Game */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 999, display: 'flex', gap: '10px' }}>
        <button onClick={toggleMute} style={{ fontSize: '24px', padding: '4px 8px', cursor: 'pointer' }}>
          {isMuted ? '🔇' : '🔊'}
        </button>
        <button onClick={testJackpot} style={{ fontSize: '24px', padding: '4px 8px', cursor: 'pointer' }} title="Probar Jackpot">
          🎰
        </button>
        <button onClick={resetGame} style={{ fontSize: '24px', padding: '4px 8px', cursor: 'pointer' }} title="Resetear Juego">
          🔄
        </button>
      </div>
      <CustomOffcanvas onBuyMachine={buyMachine} numMachines={numMachines}/>
      {/* Grid de 4x4 para organizar las máquinas tragamonedas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', justifyItems: 'center' }}>
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
            isAutoSpinning={isAutoSpinning}
            onJackpot={handleJackpot}
          />
        ))}
      </div>
      <Lowbar dinero={dinero} onSpin={() => {}} onStartAutoSpin={startAutoSpin} onStopAutoSpin={stopAutoSpin}/>

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
    </>
  );
}

export default Casino;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import gameoverImg from '../../img/LogoGameOver.png';
import menu from '../../img/menu.png';
import reintentar from '../../img/reintentar.png';

function GameOver() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
       <img src={gameoverImg} alt="gameover" style={{ maxWidth: '50%', height: 'auto' }} />

      <br />
            <img
              src={menu}
              alt="Botón menu"
              style={{ maxWidth: '10%', cursor: 'pointer', marginTop: '20px' }}
              onClick={() => navigate('/')}
            />

      <br />
            <img
              src={reintentar}
              alt="Botón again"
              style={{ maxWidth: '10%', cursor: 'pointer', marginTop: '20px' }}
              onClick={() => {
                // Reset game state: use save point if available, otherwise start fresh
                if (localStorage.getItem('hasSavePoint') === 'true') {
                  // Use saved values, don't reset
                  navigate('/juego');
                } else {
                  // Start fresh
                  localStorage.setItem('casinoDinero', '1000');
                  localStorage.setItem('numMachines', '1');
                  navigate('/juego');
                }
              }}
            />
    </div>
  );
}

export default GameOver;
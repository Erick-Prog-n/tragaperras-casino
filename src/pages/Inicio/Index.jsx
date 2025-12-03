import React from 'react';
import { useNavigate } from 'react-router-dom';
import bienvenidaImg from '../../img/LogoIncio.png';
import jugarImg from '../../img/jugar.png';

function Inicio() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <img src={bienvenidaImg} alt="Bienvenida" style={{ maxWidth: '50%', height: 'auto' }} />
      <br />
      <img
        src={jugarImg}
        alt="Botón Jugar"
        style={{ maxWidth: '10%', cursor: 'pointer', marginTop: '20px' }}
        onClick={() => {
          // Reset to fresh start
          localStorage.setItem('casinoDinero', '1000');
          localStorage.setItem('numMachines', '1');
          localStorage.removeItem('hasSavePoint');
          localStorage.removeItem('globalUpgradeLevel');
          localStorage.removeItem('machineHighRisk');
          navigate('/juego');
        }}
      />
    </div>
  );
}
export default Inicio;
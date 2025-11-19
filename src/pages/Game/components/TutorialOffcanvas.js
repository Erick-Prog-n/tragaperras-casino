import React from 'react';
import Offcanvas from 'react-bootstrap/Offcanvas';
import styles from "./Offcanvas.module.css";

function TutorialOffcanvas({ show, onHide }) {
  const handleClose = () => onHide();

  return (
    <>
      <Offcanvas show={show} onHide={handleClose} className={styles.offcanvas}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>¿Cómo Jugar?</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className={styles.offcanvasBody} style={{ padding: '1rem 2rem' }}>
          <h5>Objetivo del Juego</h5>
          <p>Gira las máquinas tragamonedas para ganar monedas. Combina símbolos para obtener premios.</p>

          <h5>Botones Principales</h5>
          <ul>
            <li><strong>SPIN</strong>: Gira la máquina para jugar.</li>
            <li><strong>Auto Spin</strong> : Activa giros automáticos para todos.</li>
            <li><strong>Stop</strong> : Detiene el auto spin.</li>
            <li><strong>Tienda</strong> : Abre la tienda para comprar mejoras.</li>
          </ul>

          <h5>Botones de Máquina</h5>
          <ul>
            <li><strong>💰 Vender</strong>: Vende la máquina por 50 monedas.</li>
            <li><strong>💀 Modo HighRisk</strong>: 10% jackpot, 90% perder mitad del saldo.</li>
            <li><strong>🔌 Encender/Apagar</strong>: Prende o apaga la máquina.</li>
          </ul>

          <h5>Mejoras Globales</h5>
          <p>En la tienda puedes comprar mejoras que afectan a todas las máquinas.</p>

        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default TutorialOffcanvas;
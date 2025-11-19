import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import styles from "./Offcanvas.module.css";

// Componente del panel lateral de la tienda
// Ahora permite comprar múltiples máquinas sin límite y punto de guardado
function CustomOffcanvas({ onBuyMachine, onBuySavePoint, onBuyGlobalUpgrade, numMachines, globalUpgradeLevel, dinero, show, onShow, onHide }) {
   const handleClose = () => onHide();
   const handleShow = () => onShow();

   // Función para calcular el costo del punto de guardado
   const getSavePointCost = () => {
     if (dinero <= 500) return 100;
     if (dinero <= 2000) return 200;
     if (dinero <= 5000) return 500;
     if (dinero <= 10000) return 1000;
     return 2000;
   };

  return (
    <>
      <Offcanvas show={show} onHide={handleClose} className={styles.offcanvas}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Tienda</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className={styles.offcanvasBody}>
          {/* Botón para comprar máquinas, muestra el contador actual */}
          <button className={styles.shopButton} onClick={onBuyMachine}>Comprar Máquina (100) - Tienes {numMachines}</button>
          <button className={styles.shopButton} onClick={onBuySavePoint}>
            Comprar Punto de Guardado ({getSavePointCost()})
          </button>
          <button className={styles.shopButton} onClick={onBuyGlobalUpgrade}>
            Comprar Mejora Global ({1000 * Math.pow(2, globalUpgradeLevel)})
          </button>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default CustomOffcanvas;
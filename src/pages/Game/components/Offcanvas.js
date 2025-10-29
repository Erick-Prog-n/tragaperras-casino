import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import styles from "./Offcanvas.module.css";

// Componente del panel lateral de la tienda
// Ahora permite comprar múltiples máquinas sin límite
function CustomOffcanvas({ onBuyMachine, numMachines }) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Tienda
      </Button>

      <Offcanvas show={show} onHide={handleClose} className={styles.offcanvas}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Tienda</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className={styles.offcanvasBody}>
          {/* Botón para comprar máquinas, muestra el contador actual */}
          <button className={styles.shopButton} onClick={onBuyMachine}>Comprar Máquina ({50}) - Tienes {numMachines}</button>
          <button className={styles.shopButton}>Comprar Item 2</button>
          <button className={styles.shopButton}>Comprar Item 3</button>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default CustomOffcanvas;
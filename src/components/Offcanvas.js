import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import "./Offcanvas.css";

function CustomOffcanvas() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Tienda
      </Button>

      <Offcanvas show={show}  onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Tienda</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div>
            <p> z z z </p>
          </div>
          <div>
            <p> z z z </p>
          </div>
          <div>
            <p style={{fontWeight: 'bold'}}> z z z </p>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default CustomOffcanvas;
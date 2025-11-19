import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Inicio from './pages/Inicio/Index';
import Casino from './pages/Game/Index';
import GameOver from './pages/GameOver/Index';

function App() {
  return (
    <>
      <div className="background"></div> {/* Fondo atrás */}

      <Router>
        <div className="centered-container">
          
          <main>
            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route path="/juego" element={<Casino />} />
              <Route path="/gameover" element={<GameOver />} />
            </Routes>
          </main>
        </div>
      </Router>
    </>
  );
}

export default App;
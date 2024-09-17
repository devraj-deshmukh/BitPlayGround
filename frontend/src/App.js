import React from 'react';
import { Link, BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { GameProvider } from './components/GameContext'; // Context to manage ongoing game globally
import Profile from './components/Profile'; // Import the updated Profile component
import Game from './components/Game';
import Game1 from './components/zz';
import './App.css';

function GameItem({ title, path }) {
  const navigate = useNavigate();

  return (
    <div className="game-item" onClick={() => navigate(path)}>
      <h3>{title}</h3>
      <button className="play-button">Play</button>
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <Router>
        <div className="App">
          <header className="App-header">
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1>BitPlayGround</h1>
            </Link>
            <div className="header-content">
              <Profile />
            </div>
          </header>
          <Routes>
            <Route path="/game1" element={<Game />} />
            <Route path="/game2" element={<Game1 />} />
            <Route
              path="/"
              element={
                <main className="game-selection">
                  <h2>Select a game to play:</h2>
                  <div className="game-list">
                    <GameItem title="Flappy Bird" path="/game1" />
                    <GameItem title="CAtto" path="/game2" />
                  </div>
                </main>
              }
            />
          </Routes>
        </div>
      </Router>
    </GameProvider>
  );
}


export default App;

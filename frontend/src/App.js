import React, { useRef } from 'react';
import { Link, BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { GameProvider } from './components/GameContext'; // Context to manage ongoing game globally
import Profile from './components/Profile'; // Import the updated Profile component
import Game from './components/Game';
import Game1 from './components/ADVGame';
import Login from './components/Login';
import Test from './components/test';
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
  const walletAddress = localStorage.getItem('walletAddress');

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
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={walletAddress ? (
                <main className="game-selection">
                  <h2>Select a game to play:</h2>
                  <div className="game-list">
                    <GameItem title="Flappy Bird" path="/game1" />
                    <GameItem title="Adventure Game" path="/game2" />
                    <GameItem title="Wheel Mania" path="/game3" />
                    <GameItem title="ML" path="/game3" />
                    <GameItem title="test" path="/test" />
                  </div>
                </main>
              ) : (
                <Link to="/login" replace />
              )}
            />
            <Route path="/game1" element={<Game />} />
            <Route path="/game2" element={<Game1 />} />
            <Route path="/game3" element={<Game1 />} />
            <Route path="/test" element={<Test />} />
          </Routes>
        </div>
      </Router>
    </GameProvider>
  );
}


export default App;

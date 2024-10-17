import React from "react";
import {
  Link,
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { GameProvider } from "./components/GameContext";
import Profile from "./components/Profile";
import Game from "./components/Game";
import Game1 from "./components/zz";
import "./App.css";

/* GameItem component with game preview */
function GameItem({ title, path, previewSrc }) {
  const navigate = useNavigate();

  return (
    <div className="game-item" onClick={() => navigate(path)}>
      <img src={previewSrc} alt={`${title} Preview`} className="game-preview" />
      <h3>{title}</h3>
      <button className="play-button">Play Now</button>
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <Router>
        <div className="App">
          <header className="App-header">
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <h1>Home</h1>
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
                  <h2>Bits-playground</h2>
                  <div className="game-list">
                    <GameItem
                      title="Flappy Bird"
                      path="/game1"
                      previewSrc="/download.jpeg"
                    />
                    <GameItem
                      title="CAtto"
                      path="/game2"
                      previewSrc="https://example.com/catto-preview.png"
                    />
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

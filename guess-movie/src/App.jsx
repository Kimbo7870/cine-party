import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import MainPage from './MainPage';
import Tiles from './Tiles';
import TrailerGame from './TrailerGame';
import MovieGame from './MovieGame';
import { ScoreProvider } from './ScoreContext';
import { GameProgressProvider } from './Progress';

const TrailerGameWithNavigation = () => {
  const navigate = useNavigate();
  return <TrailerGame onNavigateHome={() => navigate('/')} />;
};

const MovieGameWithNavigation = () => {
  const navigate = useNavigate();
  return <MovieGame onNavigateHome={() => navigate('/')} />;
};

function App() {
  return (
    <ScoreProvider>
      <GameProgressProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/game" element={<Tiles />} />
            <Route path="/main" element={<MovieGameWithNavigation />} />
            <Route path="/trailers" element={<TrailerGameWithNavigation />} />
          </Routes>
        </Router>
      </GameProgressProvider>
    </ScoreProvider>
  );
}

export default App;
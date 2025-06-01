import React, { createContext, useState, useContext, useEffect } from 'react';


const ScoreContext = createContext();


export const ScoreProvider = ({ children }) => {

  const [scores, setScores] = useState(() => {
    const savedScores = localStorage.getItem('gameScores');
    return savedScores ? JSON.parse(savedScores) : {};
  });


  useEffect(() => {
    localStorage.setItem('gameScores', JSON.stringify(scores));
  }, [scores]);

  const addPlayer = (name) => {
    if (name && !scores[name]) {
      setScores(prev => ({ ...prev, [name]: 0 }));
      return true;
    }
    return false;
  };

  const deletePlayer = (name) => {
    setScores(prev => {
      const newScores = { ...prev };
      delete newScores[name];
      return newScores;
    });
  };

  const updateScore = (name, value) => {
    if (typeof value === 'number') {
      setScores(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setScores(prev => ({
        ...prev,
        [name]: prev[name] + value
      }));
    }
  };

  const resetScores = () => {
    setScores({});
  };

  // Context value
  const value = {
    scores,
    addPlayer,
    deletePlayer,
    updateScore,
    resetScores
  };

  return (
    <ScoreContext.Provider value={value}>
      {children}
    </ScoreContext.Provider>
  );
};


export const useScores = () => {
  const context = useContext(ScoreContext);
  if (context === undefined) {
    throw new Error('useScores must be used within a ScoreProvider');
  }
  return context;
};
import React, { useState } from 'react';
import { useScores } from './ScoreContext';
import { Plus, Minus, X, Edit, Save, Trash, RefreshCw, User, Users, Award, AlertTriangle } from 'lucide-react';

const ScoreModal = ({ isOpen, onClose }) => {
  const { scores, addPlayer, deletePlayer, updateScore, resetScores } = useScores();
  const [editing, setEditing] = useState(false);
  const [newPlayer, setNewPlayer] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [incrementValue, setIncrementValue] = useState(1);

  if (!isOpen) return null;

  const handleAddPlayer = () => {
    if (addPlayer(newPlayer)) {
      setNewPlayer('');
    }
  };

  const handleScoreChange = (name, e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {

      updateScore(name, value);
    }
  };
  
  const adjustScore = (name, amount) => {
    if (scores[name] !== undefined) {
      const currentScore = scores[name];
      const newScore = currentScore + amount;
      updateScore(name, newScore);
    }
  };

  const playerList = Object.entries(scores);
  const hasPlayers = playerList.length > 0;
  const playerLimit = 100;
  const playerCount = playerList.length;
  const canAddMorePlayers = playerCount < playerLimit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 p-6 rounded-lg max-h-[90vh] w-full max-w-[66rem] overflow-y-auto border border-gray-700 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-gold-400 text-2xl font-bold flex items-center">
            <Award className="mr-2" /> Scoreboard
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gold-400">
              Players: {playerCount}/{playerLimit}
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left col */}
          <div>
            {/* new player section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <User className="text-gold-400 mr-2" />
                  <h3 className="text-gold-400 text-lg">Add Player</h3>
                </div>
                {!canAddMorePlayers && (
                  <div className="text-amber-500 text-sm flex items-center">
                    <AlertTriangle size={16} className="mr-1" />
                    Max players reached
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  className="bg-gray-800 text-white p-3 rounded flex-grow border border-gray-700 focus:border-gold-400 focus:outline-none"
                  value={newPlayer}
                  onChange={e => setNewPlayer(e.target.value)}
                  placeholder="Player name"
                  onKeyPress={e => e.key === 'Enter' && canAddMorePlayers && handleAddPlayer()}
                  disabled={!canAddMorePlayers}
                />
                <button 
                  onClick={handleAddPlayer} 
                  className={`px-4 py-2 rounded font-medium transition-colors ${
                    canAddMorePlayers && newPlayer.trim() 
                      ? 'bg-gold-600 hover:bg-gold-500 text-white' 
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!canAddMorePlayers || !newPlayer.trim()}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Score types setting */}
            {hasPlayers && (
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <RefreshCw className="text-gold-400 mr-2" size={18} />
                  <h3 className="text-gold-400 text-lg">Adjustment Value</h3>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(value => (
                    <button
                      key={value}
                      onClick={() => setIncrementValue(value)}
                      className={`px-3 py-2 rounded font-medium transition-colors ${
                        incrementValue === value 
                          ? 'bg-gold-600 text-white' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Controls section */}
            <div className="flex gap-3 mb-6">
              <button 
                onClick={() => setEditing(!editing)} 
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded flex-grow flex items-center justify-center gap-2 transition-colors"
              >
                {editing ? <><Save size={20} /> Done</> : <><Edit size={20} /> Edit</>}
              </button>
              
              {!confirmReset ? (
                <button 
                  onClick={() => hasPlayers && setConfirmReset(true)} 
                  className={`px-4 py-3 rounded flex items-center justify-center gap-2 transition-colors ${
                    hasPlayers 
                      ? 'bg-red-700 hover:bg-red-600 text-white' 
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!hasPlayers}
                >
                  <RefreshCw size={20} /> Reset
                </button>
              ) : (
                <button 
                  onClick={() => {
                    resetScores();
                    setConfirmReset(false);
                  }} 
                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded flex items-center justify-center gap-2 transition-colors"
                >
                  Confirm
                </button>
              )}
            </div>
          </div>

          {/* Right column - Player scores */}
          <div>
            {hasPlayers ? (
              <div>
                <div className="flex items-center mb-4">
                  <Users className="text-gold-400 mr-2" />
                  <h3 className="text-gold-400 text-lg">Players</h3>
                </div>
                <div className="space-y-4">
                  {playerList.map(([name, score]) => (
                    <div 
                      key={name} 
                      className="bg-gray-800 p-4 rounded-lg border border-gray-700"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white text-lg font-medium">{name}</span>
                        {editing && (
                          <button 
                            onClick={() => deletePlayer(name)} 
                            className="text-red-500 hover:text-red-400 transition-colors"
                            aria-label="Delete player"
                          >
                            <Trash size={20} />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => adjustScore(name, -incrementValue)} 
                          className="bg-red-700 hover:bg-red-600 text-white p-3 rounded-l-lg flex-none w-14 flex justify-center transition-colors"
                          aria-label="Decrease score"
                        >
                          <Minus size={24} />
                        </button>
                        <input
                          type="number"
                          value={score}
                          onChange={(e) => handleScoreChange(name, e)}
                          className="bg-gray-900 text-white text-center text-2xl p-2 rounded flex-grow border border-gray-700 focus:border-gold-400 focus:outline-none"
                        />
                        <button 
                          onClick={() => adjustScore(name, incrementValue)} 
                          className="bg-green-700 hover:bg-green-600 text-white p-3 rounded-r-lg flex-none w-14 flex justify-center transition-colors"
                          aria-label="Increase score"
                        >
                          <Plus size={24} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
                <Users size={48} className="mb-4 opacity-50" />
                <p>No players added yet</p>
                <p className="text-sm mt-2">Add players to start tracking scores</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreModal;
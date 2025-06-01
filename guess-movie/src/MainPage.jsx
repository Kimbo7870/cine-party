import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScoreModal from './ScoreModal';
import { useScores } from './ScoreContext';
import { useGameProgress } from './Progress';

const MainPage = () => {
  const navigate = useNavigate();
  const [showScores, setShowScores] = useState(false);
  const { scores } = useScores();
  
  const playerCount = Object.keys(scores).length;
  const { 
    imageIndex, 
    videoIndex, 
    imageCount, 
    videoCount,
    resetAllProgress,
    setImageIndex,
    setVideoIndex
  } = useGameProgress();

  const [indexInput, setIndexInput] = useState('');

  const [selectedMediaType, setSelectedMediaType] = useState(() => {
    return localStorage.getItem('selectedMediaType') || 'Image';
  });

  const handleMediaTypeSelection = (mediaType) => {
    setSelectedMediaType(mediaType);
    localStorage.setItem('selectedMediaType', mediaType);
    console.log(`Media type set to: ${mediaType}`);
  };

  const handleSetIndex = () => {
    const newIndex = parseInt(indexInput);
    if (isNaN(newIndex) || newIndex < 1) {
      alert('Please enter a valid number (1 or higher)');
      return;
    }

    if (selectedMediaType === 'Image') {
      if (newIndex > imageCount) {
        alert(`Index cannot exceed ${imageCount} (total image count)`);
        return;
      }
      setImageIndex(newIndex);
    } else if (selectedMediaType === 'Video') {
      if (newIndex > videoCount) {
        alert(`Index cannot exceed ${videoCount} (total video count)`);
        return;
      }
      setVideoIndex(newIndex);
    }
    
    setIndexInput('');
    console.log(`${selectedMediaType} index set to: ${newIndex}`);
  };


  // const [selectedGameMode, setSelectedGameMode] = useState(() => {
  //   return localStorage.getItem('selectedGameMode') || 'union';
  // });
  // const handleGameModeSelection = (mode) => {
  //   setSelectedGameMode(mode);
  //   localStorage.setItem('selectedGameMode', mode);
  //   console.log(`Game mode set to: ${mode}`);
  // };
  // const [selectedQuarter, setSelectedQuarter] = useState(() => {
  //   return localStorage.getItem('selectedQuarter') || 'Q1';
  // });

  // const handleQuarterSelection = (quarter) => {
  //   setSelectedQuarter(quarter);
  //   localStorage.setItem('selectedQuarter', quarter);
  //   console.log(`Quarter set to: ${quarter}`);
  // };

  return (
    <div className="min-h-screen min-w-screen bg-black flex flex-col items-center justify-center gap-4">
      <h1 className="text-yellow-500 font-bold text-3xl mb-4">PHOTO GUESSING GAME</h1>

      {/* <button
        onClick={() => navigate('/trailers')}
        className="bg-green-800 text-white px-8 py-3 rounded text-xl hover:bg-green-700"
      >
        Trailer Guessing Game
      </button> */}
            {/* Progress Display */}
      <button
        onClick={() => setShowScores(true)}
        className="bg-yellow-600 text-white px-8 py-3 rounded hover:bg-yellow-500"
      >
        Scores {playerCount > 0 && `(${playerCount})`}
      </button>
      <button
        onClick={() => navigate('/game')}
        className="bg-green-800 text-white px-8 py-3 rounded text-xl hover:bg-green-700"
      >
        Tile Game
      </button>
      {/* <button
        onClick={() => navigate('/main')}
        className="bg-green-800 text-white px-8 py-3 rounded text-xl hover:bg-green-700"
      >
        Timestamp Game
      </button> */}
      <button
        onClick={() => navigate('/main')}
        disabled={selectedMediaType === 'Image'}
        className={`bg-green-800 text-white px-8 py-3 rounded text-xl hover:bg-green-700 ${
          selectedMediaType === 'Image' ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        Timestamp Game
      </button>
    
      
      {/* <h2 className="text-white text-xl text-center">Game Modes</h2>
      <div className="flex gap-3">
        <button
          onClick={() => handleGameModeSelection('tutorial')}
          className={`px-8 py-3 rounded text-xl text-white transition-colors ${
            selectedGameMode === 'tutorial'
              ? 'bg-purple-800 hover:bg-purple-900 border-2 border-purple-500' 
              : 'bg-purple-700 hover:bg-purple-600'
          }`}
        >
          Tutorial
        </button>
        <button
          onClick={() => handleGameModeSelection('union')}
          className={`px-8 py-3 rounded text-xl text-white transition-colors ${
            selectedGameMode === 'union' 
              ? 'bg-purple-800 hover:bg-purple-900 border-2 border-purple-500' 
              : 'bg-purple-700 hover:bg-purple-600'
          }`}
        >
          Union
        </button>
        <button
          onClick={() => handleGameModeSelection('split')}
          className={`px-8 py-3 rounded text-xl text-white transition-colors ${
            selectedGameMode === 'split' 
              ? 'bg-purple-800 hover:bg-purple-900 border-2 border-purple-500' 
              : 'bg-purple-700 hover:bg-purple-600'
          }`}
        >
          Split
        </button>
      </div> */}

      <div className="flex gap-3">
        <button
          onClick={() => handleMediaTypeSelection('Image')}
          className={`px-8 py-3 rounded text-xl text-white transition-colors ${
            selectedMediaType === 'Image'
              ? 'bg-purple-800 hover:bg-purple-900 border-2 border-purple-500' 
              : 'bg-gray-700 hover:bg-purple-600'
          }`}
        >
          Images {imageIndex}/{imageCount}
        </button>
        <button
          onClick={() => handleMediaTypeSelection('Video')}
          className={`px-8 py-3 rounded text-xl text-white transition-colors ${
            selectedMediaType === 'Video' 
              ? 'bg-purple-800 hover:bg-purple-900 border-2 border-purple-500' 
              : 'bg-gray-700 hover:bg-purple-600'
          }`}
        >
          Videos {videoIndex}/{videoCount}
        </button>
      </div>
      {/* <button
        onClick={resetAllProgress}
        className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-500"
      >
        Reset Progress
      </button> */}
           <div className="flex gap-3 items-center">
        <button
          onClick={resetAllProgress}
          className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-500"
        >
          Reset Progress
        </button>
        
        <input
          type="number"
          min="1"
          max={selectedMediaType === 'Image' ? imageCount : videoCount}
          value={indexInput}
          onChange={(e) => setIndexInput(e.target.value)}
          placeholder={`Set ${selectedMediaType} index`}
          className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-600 w-40"
        />
        
        <button
          onClick={handleSetIndex}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-500"
        >
          Set {selectedMediaType} Index
        </button>
      </div>
      {/* <h2 className="text-white text-xl text-center mt-4">Select Quarter</h2>
      <div className="flex gap-3">
        <button
          onClick={() => handleQuarterSelection('Q1')}
          className={`px-8 py-3 rounded text-xl text-white transition-colors ${
            selectedQuarter === 'Q1'
              ? 'bg-blue-800 hover:bg-blue-900 border-2 border-blue-500' 
              : 'bg-blue-700 hover:bg-blue-600'
          }`}
        >
          Q1
        </button>
        <button
          onClick={() => handleQuarterSelection('Q2')}
          className={`px-8 py-3 rounded text-xl text-white transition-colors ${
            selectedQuarter === 'Q2' 
              ? 'bg-blue-800 hover:bg-blue-900 border-2 border-blue-500' 
              : 'bg-blue-700 hover:bg-blue-600'
          }`}
        >
          Q2
        </button>
        <button
          onClick={() => handleQuarterSelection('Q3')}
          className={`px-8 py-3 rounded text-xl text-white transition-colors ${
            selectedQuarter === 'Q3' 
              ? 'bg-blue-800 hover:bg-blue-900 border-2 border-blue-500' 
              : 'bg-blue-700 hover:bg-blue-600'
          }`}
        >
          Q3
        </button>
        <button
          onClick={() => handleQuarterSelection('Q4')}
          className={`px-8 py-3 rounded text-xl text-white transition-colors ${
            selectedQuarter === 'Q4' 
              ? 'bg-blue-800 hover:bg-blue-900 border-2 border-blue-500' 
              : 'bg-blue-700 hover:bg-blue-600'
          }`}
        >
          Q4
        </button>
      </div> */}
      
      <ScoreModal
        isOpen={showScores}
        onClose={() => setShowScores(false)}
      />
    </div>
  );
};

export default MainPage;
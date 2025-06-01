import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ScoreModal from './ScoreModal';
import { useGameProgress } from './Progress';

const gridModes = {
  beginner: [2, 3], easy: [3, 5], medium: [4, 6],
  hard: [6, 10], advanced: [8, 14], insane: [11, 19]
};

const gridModesHorizontal = {
  beginner: [3, 2], easy: [5, 3], medium: [6, 4],
  hard: [10, 6], advanced: [14, 8], insane: [19, 11]
};

const NotificationPopup = ({ message, type, isOpen, onClose }) => {
  useEffect(() => {
    const handleOutsideClick = () => {
      if (isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  
  let bgColor = "bg-gray-900";
  let textColor = "text-white";
  
  if (type === "error") {
    bgColor = "bg-red-500 bg-opacity-75";
    textColor = "text-red-900";
  } else if (type === "answer") {
    bgColor = "bg-yellow-500";
    textColor = "text-black";
  } else if (type === "time") {
    bgColor = "bg-yellow-500";
    textColor = "text-white";
  } else if (type === "loading") {
    bgColor = "bg-blue-500 bg-opacity-75";
    textColor = "text-white";
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`p-4 rounded-lg shadow-lg ${bgColor} max-w-md text-center`}>
        <p className={`text-lg ${textColor} font-semibold`}>{message}</p>
      </div>
    </div>
  );
};

const useTileGrid = (mode, resetTrigger, isVertical = false) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [gridMode, setGridMode] = useState(isMobile && gridModes[mode][0] > 12 ? 'hard' : mode);
  const [tiles, setTiles] = useState([]);
  
  // Use appropriate grid mode based on orientation
  const currentGridModes = isVertical ? gridModes : gridModesHorizontal;
  const [cols, rows] = currentGridModes[gridMode];

  useEffect(() => {
    setTiles(Array(cols * rows).fill(true));
  }, [cols, rows, resetTrigger]);

  const revealTile = useCallback((i) => {
    setTiles(prev => {
      const newTiles = [...prev];
      newTiles[i] = false;
      return newTiles;
    });
  }, []);

  return { tiles, setTiles, revealTile, gridMode, setGridMode, cols, rows };
};

const Toolbar = ({ seekTo, randomTime, showCurrentTime, gridMode, setGridMode, 
  revealAll, coverAll, revealAnswer, nextMedia, prevMedia, showScores, onInvalidTime, isMediaLoading, mediaType, 
  canGoPrev, canGoNext }) => {
  const [timeInput, setTimeInput] = useState('');
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const navigate = useNavigate();

  const parseTime = (input) => {
    const [h = 0, m = 0, s = 0] = input.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  };

  const handleSeek = () => {
    const time = parseTime(timeInput);
    if (isNaN(time) || time < 0) {
      onInvalidTime('Invalid time format');
      return;
    }
    seekTo(time);
  };

  return (
    <div className="bg-black p-2 flex flex-col items-center md:grid md:grid-cols-2 md:grid-rows-2 md:gap-2 xl:flex xl:flex-row xl:items-center xl:justify-between w-full flex-wrap gap-y-2 2xl:gap-y-0">
      <div>
        <button 
            onClick={() => navigate('/')}
            className="text-yellow-500 font-bold md:text-xl xl:text-2xl leading-[2rem] py-0 xl:py-1">
            {mediaType.toUpperCase()} GUESSING GAME
        </button>
      </div>
      
      {mediaType === 'Video' && (
        <div className="flex items-center gap-2 md:ml-auto xl:ml-0">
          <input
            className="bg-gray-800 text-white p-1 rounded w-24"
            placeholder="HH:MM:SS"
            value={timeInput}
            onChange={e => setTimeInput(e.target.value)}
            disabled={isMediaLoading}
          />
          <button 
            onClick={handleSeek} 
            className={`${isMediaLoading ? 'bg-gray-600' : 'bg-red-800'} text-white px-2 py-1 rounded`}
            disabled={isMediaLoading}
          >
            Go
          </button>
          <button 
            onClick={randomTime} 
            className={`${isMediaLoading ? 'bg-gray-600' : 'bg-red-800'} text-white px-2 py-1 rounded`}
            disabled={isMediaLoading}
          >
            Random
          </button>
          <button 
            onClick={showCurrentTime} 
            className={`${isMediaLoading ? 'bg-gray-600' : 'bg-red-800'} text-white px-2 py-1 rounded`}
            disabled={isMediaLoading}
          >
            Reveal Time
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <select
          value={gridMode}
          onChange={e => setGridMode(e.target.value)}
          className="bg-gray-800 text-white p-1 rounded"
          disabled={isMediaLoading}
        >
          {Object.keys(gridModes).map(mode => (
            <option key={mode} value={mode} disabled={isMobile && gridModes[mode][0] > 12}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </option>
          ))}
        </select>
        <button 
          onClick={revealAll} 
          className={`${isMediaLoading ? 'bg-gray-600' : 'bg-red-800'} text-white px-2 py-1 rounded`}
          disabled={isMediaLoading}
        >
          Reveal All
        </button>
        <button 
          onClick={coverAll} 
          className={`${isMediaLoading ? 'bg-gray-600' : 'bg-red-800'} text-white px-2 py-1 rounded`}
          disabled={isMediaLoading}
        >
          Cover All
        </button>
      </div>

      <div className="flex items-center gap-2 md:ml-auto xl:ml-0">
        <button 
          onClick={revealAnswer} 
          className={`${isMediaLoading ? 'bg-gray-600' : 'bg-yellow-600'} text-white px-2 py-1 rounded`}
          disabled={isMediaLoading}
        >
          Answer
        </button>
        <button 
          onClick={prevMedia} 
          className={`${isMediaLoading || !canGoPrev ? 'bg-gray-600' : 'bg-red-800'} text-white px-2 py-1 rounded`}
          disabled={isMediaLoading || !canGoPrev}
        >
          Prev
        </button>
        <button 
          onClick={nextMedia} 
          className={`${isMediaLoading || !canGoNext ? 'bg-gray-600' : 'bg-red-800'} text-white px-2 py-1 rounded`}
          disabled={isMediaLoading || !canGoNext}
        >
          Next
        </button>
        <button 
          onClick={showScores} 
          className="bg-yellow-600 text-white px-2 py-1 rounded"
        >
          Scores
        </button>
      </div>
    </div>
  );
};

function Tiles() {
  const [mediaData, setMediaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const mediaRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMediaLoading, setIsMediaLoading] = useState(true);
  
  const [resetTrigger, setResetTrigger] = useState(0);
  
  const [showScores, setShowScores] = useState(false);
  
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showAnswerPopup, setShowAnswerPopup] = useState(false);
  const [showTimePopup, setShowTimePopup] = useState(false);
  const [showLoadingPopup, setShowLoadingPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const mediaType = localStorage.getItem('selectedMediaType') || 'Video';
  const { imageIndex, videoIndex, imageCount, videoCount, setImageIndex, setVideoIndex } = useGameProgress();
  
  const currentIndex = mediaType === 'Image' ? imageIndex : videoIndex;
  const totalCount = mediaType === 'Image' ? imageCount : videoCount;
  const setCurrentIndex = mediaType === 'Image' ? setImageIndex : setVideoIndex;

  const canGoPrev = currentIndex > 1;
  const canGoNext = currentIndex < totalCount;

  const currentMedia = useMemo(() => {
    if (mediaData.length === 0 || currentIndex < 1 || currentIndex > mediaData.length) {
      return null;
    }
    return mediaData[currentIndex - 1];
  }, [mediaData, currentIndex]);

  const isVertical = useMemo(() => {
    return currentMedia?.dimension === 'vertical';
  }, [currentMedia]);

  const { tiles, setTiles, revealTile, gridMode, setGridMode, cols, rows } = useTileGrid('beginner', resetTrigger, isVertical);

  const columnLabels = useMemo(() => {
    return Array.from({ length: cols }, (_, i) => 
      String.fromCharCode(65 + i)
    );
  }, [cols]);
  
  const rowLabels = useMemo(() => {
    return Array.from({ length: rows }, (_, i) => (i + 1).toString());
  }, [rows]);

  useEffect(() => {
    const fetchMediaData = async () => {
      try {
        setLoading(true);
        const endpoint = mediaType === 'Image' ? '/data/data2.json' : '/data/data.json';
        console.log(`Fetching ${mediaType.toLowerCase()} data from: ${endpoint}`);
        
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${mediaType.toLowerCase()} data: ${response.status}`);
        }
        const data = await response.json();
        console.log(`${mediaType} data loaded:`, data.length);
        setMediaData(data);
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching ${mediaType.toLowerCase()} data:`, err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchMediaData();
  }, [mediaType]);

  useEffect(() => {
    if (currentMedia && !loading) {
      console.log(`Current ${mediaType.toLowerCase()}: ${currentIndex}/${totalCount} - ${currentMedia.title}`);
    }
  }, [currentMedia, currentIndex, totalCount, mediaType, loading]);
  
  const isVideoReady = useCallback(() => {
    if (mediaType === 'Image') return true;
    if (!mediaRef.current) return false;
    
    const video = mediaRef.current;
    return video.readyState >= 2 && 
           typeof video.duration === 'number' && 
           isFinite(video.duration) && 
           video.duration > 0;
  }, [mediaType]);
  
  useEffect(() => {
    if (!currentMedia) return;
    
    if (mediaType === 'Image') {
      setIsMediaLoading(false);
      return;
    }
    
    if (!mediaRef.current) return;
    
    setIsMediaLoading(true);
    
    const video = mediaRef.current;
    
    const checkVideoLoaded = () => {
      if (isVideoReady()) {
        setIsMediaLoading(false);
        return true;
      }
      return false;
    };
    
    const handleMetadataLoaded = () => {
      if (checkVideoLoaded()) {
        randomTime();
      }
    };
    
    video.addEventListener('loadedmetadata', handleMetadataLoaded);
    video.addEventListener('loadeddata', handleMetadataLoaded);
    
    const intervalId = setInterval(() => {
      if (checkVideoLoaded()) {
        clearInterval(intervalId);
      }
    }, 100);
    
    return () => {
      video.removeEventListener('loadedmetadata', handleMetadataLoaded);
      video.removeEventListener('loadeddata', handleMetadataLoaded);
      clearInterval(intervalId);
    };
  }, [currentMedia, isVideoReady, mediaType]);
  
  useEffect(() => {
    if (isMediaLoading && currentMedia) {
      setPopupMessage(`Loading ${mediaType.toLowerCase()}...`);
      setShowLoadingPopup(true);
    } else if (loading) {
      setPopupMessage(`Loading ${mediaType.toLowerCase()} data...`);
      setShowLoadingPopup(true);
    } else {
      setShowLoadingPopup(false);
    }
  }, [isMediaLoading, loading, currentMedia, mediaType]);
  
  const seekTo = useCallback((time) => {
    if (mediaType === 'Video' && mediaRef.current && isVideoReady()) {
      mediaRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, [isVideoReady, mediaType]);

  const randomTime = useCallback(() => {
    if (mediaType === 'Image') return null;
    if (!mediaRef.current || !isVideoReady()) return null;

    try {
      const duration = mediaRef.current.duration;
      const time = Math.random() * duration;
      mediaRef.current.currentTime = time;
      setCurrentTime(time);
      return time;
    } catch (error) {
      console.error("Error setting random time:", error);
      return null;
    }
  }, [isVideoReady, mediaType]);

  const nextMedia = useCallback(() => {
    if (currentIndex < totalCount) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setIsMediaLoading(true);
      setResetTrigger(prev => prev + 1);
    }
  }, [currentIndex, totalCount, setCurrentIndex]);

  const prevMedia = useCallback(() => {
    if (currentIndex > 1) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setIsMediaLoading(true);
      setResetTrigger(prev => prev + 1);
    }
  }, [currentIndex, setCurrentIndex]);
  
  const handleInvalidTime = (message) => {
    setPopupMessage(message);
    setShowErrorPopup(true);
  };

  const handleSeek = (time) => {
    if (mediaType === 'Image') return;
    
    if (!isVideoReady()) {
      setPopupMessage('Video is not ready yet');
      setShowErrorPopup(true);
      return;
    }
    
    if (mediaRef.current && time > mediaRef.current.duration) {
      setPopupMessage('Time exceeds video duration');
      setShowErrorPopup(true);
      return;
    }
    
    seekTo(time);

    if (currentMedia) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60).toString().padStart(2, '0');
      console.log(`Seeking to time for ${currentMedia.title} --> ${minutes}:${seconds}`);
    }
    
    setResetTrigger(prev => prev + 1);
  };

  const handleRandomTime = () => {
    if (mediaType === 'Image') return;
    
    if (!isVideoReady()) {
      setPopupMessage('Video is not ready yet');
      setShowErrorPopup(true);
      return;
    }

    const time = randomTime();

    if (time !== null && currentMedia) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60).toString().padStart(2, '0');
      console.log(`Random time for ${currentMedia.title} --> ${minutes}:${seconds}`);
    }
    setResetTrigger(prev => prev + 1);
  };

  const showCurrentTimePopup = () => {
    if (mediaType === 'Image') return;
    
    if (!isVideoReady()) {
      setPopupMessage('Video is not ready yet');
      setShowErrorPopup(true);
      return;
    }
    
    const minutes = Math.floor(mediaRef.current.currentTime / 60);
    const seconds = Math.floor(mediaRef.current.currentTime % 60).toString().padStart(2, '0');
    setPopupMessage(`Current time: ${minutes}:${seconds}`);
    setShowTimePopup(true);
  };

  const handleRevealAnswer = () => {
    if ((mediaType === 'Video' && !isVideoReady()) || !currentMedia) {
      setPopupMessage(`${mediaType} is not ready yet`);
      setShowErrorPopup(true);
      return;
    }
    
    if (currentMedia) {
      setPopupMessage(`Answer: ${currentMedia.title}`);
      setShowAnswerPopup(true);
    } else {
      setPopupMessage(`Cannot determine current ${mediaType.toLowerCase()}`);
      setShowErrorPopup(true);
    }
  };

  // If still loading data
  if (loading) {
    return (
      <div className="w-screen h-screen bg-black flex justify-center items-center">
        <div className="text-white text-2xl">Loading {mediaType.toLowerCase()} data...</div>
      </div>
    );
  }

  // If there was an error loading data
  if (error) {
    return (
      <div className="w-screen h-screen bg-black flex justify-center items-center">
        <div className="text-red-500 text-2xl">Error loading {mediaType.toLowerCase()}s: {error}</div>
      </div>
    );
  }

  // If no data was found
  if (mediaData.length === 0) {
    return (
      <div className="w-screen h-screen bg-black flex justify-center items-center">
        <div className="text-yellow-500 text-2xl">No {mediaType.toLowerCase()}s found in data file</div>
      </div>
    );
  }

  // If no current media
  if (!currentMedia) {
    return (
      <div className="w-screen h-screen bg-black flex justify-center items-center">
        <div className="text-yellow-500 text-2xl">No {mediaType.toLowerCase()} available at index {currentIndex}</div>
      </div>
    );
  }

  return (
    <div className="w-screen bg-black">
      <div className="w-full flex justify-center">
        <div className="min-h-screen bg-black flex flex-col justify-center items-center overflow-hidden px-[2.5vw]">
          <Toolbar
            seekTo={handleSeek}
            randomTime={handleRandomTime}
            showCurrentTime={showCurrentTimePopup}
            gridMode={gridMode}
            setGridMode={setGridMode}
            revealAll={() => setTiles(Array(cols * rows).fill(false))}
            coverAll={() => setTiles(Array(cols * rows).fill(true))}
            revealAnswer={handleRevealAnswer}
            nextMedia={nextMedia}
            prevMedia={prevMedia}
            showScores={() => setShowScores(true)}
            onInvalidTime={handleInvalidTime}
            isMediaLoading={isMediaLoading}
            mediaType={mediaType}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
          />
          
          {/* Container for media with external labels */}
          <div className="flex flex-col mt-6 max-w-[95vw] max-h-[90vh]">
            {/* Top column labels */}
            <div className="flex mb-1">
              {/* Empty corner space for row labels */}
              <div className="w-6 h-6"></div>
              
              {/* Column labels */}
              <div className="flex" style={{
                width: isVertical 
                  ? 'min(85vh * 9/16, 95vw)' 
                  : 'min(85vh * 16/9, 95vw)'
              }}>
                {columnLabels.map((label) => (
                  <div 
                    key={`col-${label}`} 
                    className="flex-1 h-6 bg-black bg-opacity-70 flex items-center justify-center text-white text-sm font-bold border border-gray-700"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Main content row with side labels and media */}
            <div className="flex">
              {/* Left row labels */}
              <div className="flex flex-col mr-1" style={{
                height: isVertical 
                  ? 'min(85vh * 16/9 * 9/16, 95vw * 16/9)' 
                  : 'min(85vh, 95vw * 9/16)'
              }}>
                {rowLabels.map((label) => (
                  <div 
                    key={`row-${label}`} 
                    className="w-6 flex-1 bg-black bg-opacity-70 flex items-center justify-center text-white text-sm font-bold border border-gray-700"
                  >
                    {label}
                  </div>
                ))}
              </div>
              
              {/* Media container with grid overlay */}
              <div className={`relative ${
                isVertical 
                  ? 'aspect-[9/16]' // Phone vertical aspect ratio
                  : 'aspect-[16/9]'  // Horizontal aspect ratio
              }`} style={{
                aspectRatio: isVertical ? '9/16' : '16/9',
                width: isVertical 
                  ? 'min(85vh * 9/16, 95vw)' 
                  : 'min(85vh * 16/9, 95vw)',
                height: isVertical 
                  ? 'min(85vh, 95vw * 16/9)' 
                  : 'min(85vh, 95vw * 9/16)'
              }}>
                {/* Media element */}
                {currentMedia && (
                  mediaType === 'Video' ? (
                    <video
                      ref={mediaRef}
                      src={currentMedia.file}
                      className="w-full h-full object-cover"
                      // classname="w-full h-full object-contain"
                      muted
                      controls={false}
                    />
                  ) : (
                    <img
                      ref={mediaRef}
                      src={currentMedia.file}
                      alt={currentMedia.title}
                      className="w-full h-full object-cover"
                      // classname="w-full h-full object-contain"
                    />
                  )
                )}
                
                {/* Grid overlay */}
                <div 
                  className="absolute inset-0 grid"
                  style={{
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                  }}
                >
                  {tiles.map((visible, i) => {
                    const col = i % cols;
                    const row = Math.floor(i / cols);
                    const cellCoord = `${columnLabels[col]}${rowLabels[row]}`;
                    
                    return (
                      <div
                        key={i}
                        onClick={() => revealTile(i)}
                        className={`transition-opacity ${visible ? 'duration-0' : 'duration-500'} bg-black cursor-pointer ${visible ? 'border border-gray-700 opacity-100' : 'opacity-0 pointer-events-none'}`}
                        title={cellCoord} 
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          <ScoreModal
            isOpen={showScores}
            onClose={() => setShowScores(false)}
          />
          
          <NotificationPopup 
            message={popupMessage}
            type="error"
            isOpen={showErrorPopup}
            onClose={() => setShowErrorPopup(false)}
          />
          
          <NotificationPopup 
            message={popupMessage}
            type="answer"
            isOpen={showAnswerPopup}
            onClose={() => setShowAnswerPopup(false)}
          />
          
          <NotificationPopup 
            message={popupMessage}
            type="time"
            isOpen={showTimePopup}
            onClose={() => setShowTimePopup(false)}
          />
          
          <NotificationPopup 
            message={popupMessage}
            type="loading"
            isOpen={showLoadingPopup}
            onClose={() => setShowLoadingPopup(false)}
          />
        </div>
      </div>
    </div>
  );
}

export default Tiles;
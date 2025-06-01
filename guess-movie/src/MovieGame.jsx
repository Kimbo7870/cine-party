// App.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import ScoreModal from './ScoreModal';
import { useScores } from './ScoreContext';
import { useGameProgress } from "./Progress";
// import { useLocation } from 'react-router-dom';



const durations = [1, 3, 5, 10, 20, 30, 60]; 


// const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);


const WallLight = ({ delay = 0, top = "0%" }) => {
  return (
    <div
      className="absolute w-4 h-2 rounded-full bg-yellow-500/30"
      style={{
        top,
        animation: `pulseLight 4s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
};


const style = document.createElement("style");
style.textContent = `
  @keyframes pulseLight {
    0%, 100% { opacity: 0.3; box-shadow: 0 0 5px rgba(234, 179, 8, 0.3); }
    50% { opacity: 0.7; box-shadow: 0 0 15px rgba(234, 179, 8, 0.6); }
  }
`;
document.head.appendChild(style);


function MovieGame({ onNavigateHome }) {
  const [videoQueue, setVideoQueue] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [timestampInput, setTimestampInput] = useState("");
  const [showTimestamp, setShowTimestamp] = useState(false);
  const [duration, setDuration] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showBirdName, setShowBirdName] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
//   const { scores, addPlayer, deletePlayer, updateScore, resetScores } = useScores();
  const { scores } = useScores();
  const [showScoreboardModal, setShowScoreboardModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayTime, setDisplayTime] = useState("0.0");
  const [showInvalidTimestampPopup, setShowInvalidTimestampPopup] = useState(false);
  const [invalidTimestampMessage, setInvalidTimestampMessage] = useState("");
  const [isTimestampValid, setIsTimestampValid] = useState(true);


  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [movies, setMovies] = useState([]);
  const [pausedTime, setPausedTime] = useState(null);

  // const gameMode = localStorage.getItem('selectedGameMode') || 'union';
  const selectedMediaType = localStorage.getItem('selectedMediaType') || 'Video';
  const { imageIndex, videoIndex, videoCount, incrementImageIndex, incrementVideoIndex } = useGameProgress();

  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.5);

  const secondsToTimestamp = (seconds) => {
    if (isNaN(seconds)) return "00:00:00";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  const timestampToSeconds = (timestamp) => {
    if (!timestamp || timestamp === '') return 0;
    const parts = timestamp.split(':').map(part => parseInt(part) || 0);
    while (parts.length < 3) parts.unshift(0);
    

    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  };

    useEffect(() => {
    const fetchMovies = async () => {
      try {

        // const selectedQuarter = localStorage.getItem('selectedQuarter') || 'Q1';
        // console.log(`Fetching movies for game mode: ${gameMode}, quarter: ${selectedQuarter}`);
        console.log(`Fetching data from data/data.json`);
        const response = await fetch('/data/data.json');

        // let endpoint;
        
        // switch(gameMode) {
        //   case 'union':
        //     endpoint = '/data/movies.json';
        //     break;
        //   case 'split':

        //     endpoint = `/split/MovieGame${selectedQuarter}.json`;
        //     break;
        //   case 'tutorial':
        //     endpoint = '/tutorial/MovieGame.json';
        //     break;
        //   default:
        //     endpoint = '/data/movies.json';
        // }
        
        // const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        const data = await response.json();
        // console.log("Movies loaded:", data.length);
        setMovies(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };
    
    fetchMovies();
  }, []);




      useEffect(() => {
    if (movies.length > 0) {
      let currentIndex;
      
      if (selectedMediaType === 'Video') {
        currentIndex = Math.max(0, Math.min(videoIndex - 1, movies.length - 1));
      } else {
        currentIndex = Math.max(0, Math.min(imageIndex - 1, movies.length - 1));
      }
      
      const selectedMovie = movies[currentIndex];
      setCurrentVideo(selectedMovie);
      setIsLoading(false);
      console.log(`Video Number: ${currentIndex + 1}/${videoCount} | Video Name: ${selectedMovie?.title}`);
    }
  }, [movies, imageIndex, videoIndex, videoCount, selectedMediaType]);


  useEffect(() => {
    if (videoRef.current && showVideo) {
      if (isPlaying) {
        videoRef.current.currentTime = audioRef.current.currentTime;
        videoRef.current.play().catch(() => setError("Video playback failed"));
      } else {
        videoRef.current.currentTime = audioRef.current.currentTime;
      }
    }
  }, [showVideo, isPlaying]);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(previousVolume);
      if (audioRef.current) audioRef.current.volume = previousVolume;
      if (videoRef.current) videoRef.current.volume = previousVolume;
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      if (audioRef.current) audioRef.current.volume = 0;
      if (videoRef.current) videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };


// const handleNextVideo = useCallback(() => {
//   setIsPlaying(false);
//   setShowVideo(false);
//   setCurrentTime(0);
//   setDisplayTime("0.0");
//   setTimestamp(0);
//   setTimestampInput("");
//   setIsTimestampValid(true);
//   setShowBirdName(false);
  
//   if (animationFrameRef.current) {
//     cancelAnimationFrame(animationFrameRef.current);
//   }
  
//   if (videoQueue.length === 0) {
//     const newShuffledMovies = shuffleArray([...movies]);
//     setVideoQueue(newShuffledMovies.slice(1));
//     setCurrentVideo(newShuffledMovies[0]);
//   } else {
//     setCurrentVideo(videoQueue[0]);
//     console.log(`Next movie loaded: ${videoQueue[0]?.title} (${videoQueue[0]?.year})`);
//     setVideoQueue((prev) => prev.slice(1));
//   }
  
// }, [videoQueue, currentVideo, movies]);
const handleNextVideo = useCallback(() => {
    setIsPlaying(false);
    setShowVideo(false);
    setCurrentTime(0);
    setDisplayTime("0.0");
    setTimestamp(0);
    setTimestampInput("");
    setIsTimestampValid(true);
    setShowBirdName(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Increment the appropriate index based on selected media type
    if (selectedMediaType === 'Video') {
      incrementVideoIndex();
    } else {
      console.log("Shouldn't happen")
      incrementImageIndex();
    }
    
  }, [selectedMediaType, incrementImageIndex, incrementVideoIndex]);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      videoRef.current?.pause();
      setPausedTime(audioRef.current.currentTime);
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } else {
      if (!isTimestampValid) {
        setInvalidTimestampMessage("Please enter start time in seconds");
        setShowInvalidTimestampPopup(true);
        setTimeout(() => setShowInvalidTimestampPopup(false), 2000);
        return;
      }
  
      const validTimestamp = Math.min(
        timestamp || 0,
        Math.max(0, videoDuration - duration)
      );
      audioRef.current.currentTime = validTimestamp;
      audioRef.current.play().catch(() => setError("Audio playback failed"));
      if (showVideo && videoRef.current) {
        videoRef.current.currentTime = validTimestamp;
        videoRef.current.play().catch(() => setError("Video playback failed"));
      }
      setCurrentTime(0);
      setDisplayTime("0.0");
      setIsPlaying(true);
      setPausedTime(null);
    }
  };

  const handleResume = () => {
    if (pausedTime !== null) {
      audioRef.current.currentTime = pausedTime;
      audioRef.current.play().catch(() => setError("Audio playback failed"));
      if (showVideo && videoRef.current) {
        videoRef.current.currentTime = pausedTime;
        videoRef.current.play().catch(() => setError("Video playback failed"));
      }
      setIsPlaying(true);
    }
  };


  const updateProgressBar = useCallback(() => {
    if (!audioRef.current || !isPlaying) return;


    const effectiveTimestamp = Math.min(
      timestamp || 0,
      Math.max(0, videoDuration - duration)
    );
    const current = audioRef.current.currentTime;
    const elapsedTime = Math.max(0, current - effectiveTimestamp);


    if (elapsedTime >= duration) {
      setIsPlaying(false);
      audioRef.current?.pause();
      videoRef.current?.pause();
      setCurrentTime(duration);
      setDisplayTime(duration.toFixed(1));
      return;
    }


    if (
      showVideo &&
      videoRef.current &&
      Math.abs(videoRef.current.currentTime - current) > 0.1
    ) {
      videoRef.current.currentTime = current;
    }


    const roundedTime = Math.min(Math.round(elapsedTime * 10) / 10, duration);


    setCurrentTime(roundedTime);


    setDisplayTime(secondsToTimestamp(roundedTime));


    animationFrameRef.current = requestAnimationFrame(updateProgressBar);
  }, [isPlaying, timestamp, videoDuration, duration, showVideo]);


  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateProgressBar);
    }


    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, updateProgressBar]);


  const handleTimeUpdate = () => {
    if (!audioRef.current || !isPlaying) return;
  
    const effectiveTimestamp = Math.min(
      timestamp || 0,
      Math.max(0, videoDuration - duration)
    );
    const current = audioRef.current.currentTime;
    const elapsedTime = Math.max(0, current - effectiveTimestamp);
  
    if (elapsedTime >= duration) {
      setIsPlaying(false);
      audioRef.current?.pause();
      videoRef.current?.pause();
      cancelAnimationFrame(animationFrameRef.current);
      setPausedTime(null);
    }
  };


  const handleRandomTimestamp = () => {
    if (videoDuration) {
      let newTimestampToSet = Math.random() * (videoDuration - duration);
      if (newTimestampToSet < 0) {
        newTimestampToSet = 0;
      }
      let loggingValue = secondsToTimestamp(newTimestampToSet)
      console.log(`For movie: ${currentVideo?.title}, random stamp: ${loggingValue}`)
      setTimestamp(newTimestampToSet);
      setTimestampInput("");
      setIsTimestampValid(true);
    }
  };

  const handleTimestampInputChange = (e) => {
    const value = e.target.value;
    setTimestampInput(value);
  };
    
  // const handleSetTimestamp = () => {
  //   // Validate timestamp format
  //   const isValidFormat = /^(\d{1,2}:)?(\d{1,2}:)?(\d{1,2})$/.test(timestampInput);
    
  //   if (isValidFormat) {
  //     const seconds = timestampToSeconds(timestampInput);
  //     setTimestamp(seconds);
  //     setIsTimestampValid(true);
      
  //     if (videoDuration && seconds > videoDuration - duration) {
  //       setInvalidTimestampMessage(
  //         "Starting timestamp + duration exceeds available video length!"
  //       );
  //       setShowInvalidTimestampPopup(true);
  //       setTimeout(() => setShowInvalidTimestampPopup(false), 2000);
  //     }
  //   } else {
  //     setIsTimestampValid(false);
  //     setInvalidTimestampMessage("Please enter time in HH:MM:SS format");
  //     setShowInvalidTimestampPopup(true);
  //     setTimeout(() => setShowInvalidTimestampPopup(false), 2000);
  //   }
  // };
  const handleSetTimestamp = () => {
    const isSecondsFormat = /^\d+$/.test(timestampInput);
    const isValidFormat = isSecondsFormat || /^(\d{1,2}:)?(\d{1,2}:)?(\d{1,2})$/.test(timestampInput);
    
    if (isValidFormat) {
      const seconds = isSecondsFormat 
        ? parseInt(timestampInput, 10) 
        : timestampToSeconds(timestampInput);
      
      setTimestamp(seconds);
      setIsTimestampValid(true);
      
      if (videoDuration && seconds > videoDuration - duration) {
        setInvalidTimestampMessage(
          "Starting timestamp + duration exceeds available video length!"
        );
        setShowInvalidTimestampPopup(true);
        setTimeout(() => setShowInvalidTimestampPopup(false), 2000);
      }
    } else {
      setIsTimestampValid(false);
      setInvalidTimestampMessage("Please enter time in HH:MM:SS or seconds format or seconds");
      setShowInvalidTimestampPopup(true);
      setTimeout(() => setShowInvalidTimestampPopup(false), 2000);
    }
  };


  const toggleShowVideo = () => {
    setShowVideo((prev) => !prev);
  };

  return (
    <div className="w-screen bg-neutral-900">
      <div className="w-full flex justify-center">
    <div className="min-h-screen bg-neutral-900 text-yellow-100 font-serif relative overflow-hidden flex-row">
      <div className="absolute left-2 -top-6 bottom-0 w-6 hidden md:block">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <WallLight key={`left-${i}`} delay={i * 0.5} top={`${8 + i * 9}%`} />
        ))}
      </div>
      <div className="absolute right-0 -top-6 bottom-0 w-6 hidden md:block">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <WallLight
            key={`right-${i}`}
            delay={i * 0.5 + 0.25}
            top={`${8 + i * 9}%`}
          />
        ))}
      </div>


      {!showBirdName && (
        <button 
        onClick={onNavigateHome}
        className="text-3xl w-full text-center md:absolute md:left-1/2 md:-translate-x-1/2 md:-top-2 md:m-0 pt-4 pb-2 text-yellow-400 font-bold">
          Theatre
        </button>
      )}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-4 md:p-8 md:pt-12">
        <div className="hidden md:block md:w-1/4 bg-red-900/80 p-6 rounded-lg shadow-lg border-2 border-yellow-600 self-center">
          <h2 className="text-xl md:text-xl lg:text-2xl mb-4 text-yellow-400 text-center">
            Control Booth
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm md:text-sm lg:text-base">
                Start Timestamp:
              </label>
              <input
                type="text"
                value={timestampInput}
                placeholder="sec"
                onChange={handleTimestampInputChange}
                className={`w-full bg-gray-800 text-white p-2 rounded ${
                    !isTimestampValid ? "border-2 border-red-500" : ""
                }`}
                />
                <button
                onClick={handleSetTimestamp}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black py-2 mt-3 rounded transition text-sm md:text-sm lg:text-base"
                >
                Set
                </button>
            </div>
            <div>
              <label className="block mb-2 text-sm md:text-sm lg:text-base">
                Duration (s):
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-gray-800 text-white p-2 rounded"
              >
                {durations.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleRandomTimestamp}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-black py-2 rounded transition text-sm md:text-sm lg:text-base"
            >
              Random Timestamp
            </button>
            <div>
              <label className="block mb-2 text-sm md:text-sm lg:text-base">
                Volume:
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMuteToggle}
                  className="bg-yellow-600 hover:bg-yellow-700 text-black px-3 py-1 rounded transition text-sm"
                >
                  {isMuted ? "🔇" : volume > 0.5 ? "🔊" : volume > 0 ? "🔉" : "🔈"}
                </button>
                <div className="flex-1 min-w-0 px-1">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full accent-yellow-600 h-2"
                    style={{
                      background: `linear-gradient(to right, #ca8a04 0%, #ca8a04 ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`
                    }}
                  />
                </div>
                <span className="text-xs text-yellow-200 w-10 text-right">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>
            </div>
            <button
                onClick={() => setShowTimestamp((prev) => !prev)}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black py-2 rounded transition text-sm md:text-sm lg:text-base"
                >
                {showTimestamp
                    ? `Starting: ${secondsToTimestamp(timestamp ?? 0)}`
                    : "Starting Time: Hidden"}
            </button>
          </div>
        </div>


        <div className="w-full md:w-2/4 h-[40vh] md:h-[90vh] lg:h-[90vh] xl:h-[90vh] xl:w-[60vw] 2xl:w-[70vw] bg-black pt-0 rounded-lg border-4 border-yellow-600 shadow-2xl relative flex items-center justify-center">
            {showBirdName && currentVideo && (
            <div className="absolute top-[321px] md:-top-12 left-1/2 transform -translate-x-1/2 bg-red-900 px-8 md:px-4 py-1 md:py-2 rounded border-2 border-yellow-600 text-sm md:text-sm lg:text-base">
                {currentVideo.title}
            </div>
            )}
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900 p-4 rounded border-2 border-yellow-600 text-center text-sm md:text-sm lg:text-base">
              {error}
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* <audio
                ref={audioRef}
                src={currentVideo?.file}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={(e) => setVideoDuration(e.target.duration)}
                /> */}
                <audio
                  ref={audioRef}
                  src={currentVideo?.file}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={(e) => {
                    setVideoDuration(e.target.duration);
                    e.target.volume = isMuted ? 0 : volume;
                  }}
                />
            <video
            ref={videoRef}
            src={currentVideo?.file}
            className={`max-w-full max-h-full object-contain ${
                showVideo ? "block" : "hidden"
            }`}
            onLoadedMetadata={(e) => {
                if (audioRef.current) {
                e.target.currentTime = audioRef.current.currentTime;
                }
            }}
            />
              {isPlaying && !showVideo && (
                <div className="space-y-3 absolute inset-0 flex flex-col justify-center px-6 md:px-8 lg:px-12">
                  <div className="w-full h-3 md:h-4 bg-gray-700 rounded-full overflow-hidden relative">
                    <div
                      className="absolute top-0 left-0 h-full bg-yellow-600 rounded-full transition-all duration-75 ease-linear"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-center text-white text-sm md:text-sm lg:text-base">
                    {secondsToTimestamp(currentTime)} / {secondsToTimestamp(duration)}
                    </div>
                </div>
              )}
            </div>
          )}
        </div>


        <div className="hidden md:block md:w-1/4 bg-red-900/80 p-6 rounded-lg shadow-lg border-2 border-yellow-600 self-center">
          <h2 className="text-xl md:text-xl lg:text-2xl mb-4 text-yellow-400 text-center">
            Showtime Controls
          </h2>
          <div className="space-y-4">
            <button
              onClick={handlePlayPause}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-black py-2 rounded transition text-sm md:text-sm lg:text-base"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            {pausedTime !== null && !isPlaying && (
                <button
                onClick={handleResume}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black py-2 rounded transition text-sm md:text-sm lg:text-base"
                >
                Resume
                </button>
            )}
            <button
                onClick={toggleShowVideo}
                disabled={isPlaying}
                className={`w-full py-2 rounded transition ${
                    isPlaying
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : showVideo
                        ? "bg-yellow-500 border-2 border-yellow-300 shadow-inner text-black hover:bg-yellow-700"
                        : "bg-yellow-600 hover:bg-yellow-700 text-black"
                }`}
                >
                {showVideo ? "Hide" : "Show"} Video
            </button>
            <button
              onClick={() => setShowBirdName(!showBirdName)}
              className={`w-full bg-yellow-600 hover:bg-yellow-700 text-black py-2 rounded transition text-sm md:text-sm lg:text-base ${
                showBirdName
                  ? "border-2 border-yellow-300 bg-yellow-500 shadow-inner"
                  : ""
              }`}
            >
              {showBirdName ? "Hide" : "Reveal"} Video Title
            </button>
            <button
              onClick={handleNextVideo}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-black py-2 rounded transition text-sm md:text-sm lg:text-base"
            >
              Next {selectedMediaType}
            </button>
            <button
              onClick={() => setShowScoreboardModal(true)}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-black py-2 rounded transition text-sm md:text-sm lg:text-base"
            >
              Edit Scoreboard
            </button>
          </div>
        </div>


        <div className="w-full md:hidden bg-red-900/80 p-6 mt-6 rounded-lg shadow-lg border-2 border-yellow-600">
          <h2 className="text-2xl mb-4 text-yellow-400 text-center">
            Control Booth
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Start Timestamp:</label>
              <input
                type="text"
                value={timestampInput}
                placeholder="sec"
                onChange={handleTimestampInputChange}
                className={`w-full bg-gray-800 text-white p-2 rounded ${
                  !isTimestampValid ? "border-2 border-red-500" : ""
                }`}
              />
              <button
                onClick={handleSetTimestamp}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black py-2 mt-3 rounded transition text-sm md:text-sm lg:text-base"
                >
                Set
                </button>
            </div>
            <div>
              <label className="block mb-2">Duration (s):</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-gray-800 text-white p-2 rounded"
              >
                {durations.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleRandomTimestamp}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-black py-2 rounded transition"
            >
              Random Timestamp
            </button>
            <div>
              <label className="block mb-2 text-sm md:text-sm lg:text-base">
                Volume:
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMuteToggle}
                  className="bg-yellow-600 hover:bg-yellow-700 text-black px-3 py-1 rounded transition text-sm"
                >
                  {isMuted ? "🔇" : volume > 0.5 ? "🔊" : volume > 0 ? "🔉" : "🔈"}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="flex-1 accent-yellow-600 h-2"
                  style={{
                    background: `linear-gradient(to right, #ca8a04 0%, #ca8a04 ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`
                  }}
                />
                <span className="text-xs text-yellow-200 w-10 text-right">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>
            </div>
            <button
                onClick={() => setShowTimestamp((prev) => !prev)}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black py-2 rounded transition text-sm md:text-sm lg:text-base"
                >
                {showTimestamp
                    ? `Starting: ${secondsToTimestamp(timestamp ?? 0)}`
                    : "Starting Time: Hidden"}
            </button>
          </div>
          <h2 className="text-2xl mb-4 mt-4 text-yellow-400 text-center">
            Showtime Controls
          </h2>
          <div className="space-y-4">
            <button
              onClick={handlePlayPause}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-black py-2 rounded transition"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            {pausedTime !== null && !isPlaying && (
                <button
                onClick={handleResume}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black py-2 rounded transition text-sm md:text-sm lg:text-base"
                >
                Resume
                </button>
            )}
            <button
                onClick={toggleShowVideo}
                disabled={isPlaying}
                className={`w-full py-2 rounded transition ${
                    isPlaying
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : showVideo
                        ? "bg-yellow-500 border-2 border-yellow-300 shadow-inner text-black hover:bg-yellow-700"
                        : "bg-yellow-600 hover:bg-yellow-700 text-black"
                }`}
                >
                {showVideo ? "Hide" : "Show"} Video
            </button>
            <button
              onClick={() => setShowBirdName(!showBirdName)}
              className={`w-full bg-yellow-600 hover:bg-yellow-700 text-black py-2 rounded transition ${
                showBirdName
                  ? "border-2 border-yellow-300 bg-yellow-500 shadow-inner"
                  : ""
              }`}
            >
              {showBirdName ? "Hide" : "Reveal"} Video Title
            </button>
            <button
              onClick={handleNextVideo}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-black py-2 rounded transition"
            >
              Next {selectedMediaType}
            </button>
            <button
              onClick={() => setShowScoreboardModal(true)}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-black py-2 rounded transition"
            >
              Edit Scoreboard
            </button>
          </div>
        </div>
      </div>


      <div className="flex flex-wrap justify-center gap-8 p-8 bottom-0 left-0 right-0">
      {Object.entries(scores).map(([name, score], index) => (
        <div
            key={index}
            className="relative w-40 h-40 bg-red-950 rounded-t-3xl overflow-hidden shadow-lg"
        >
            <div className="absolute top-0 left-0 right-0 h-full bg-red-950 rounded-t-3xl"></div>

            <div className="absolute top-8 bottom-8 left-2 right-2 flex flex-col justify-center items-center">
            <div className="w-full h-full bg-red-800 rounded-lg flex flex-col items-center justify-center p-2">
                <div
                className={`text-white font-bold ${
                    name.length > 12
                    ? "text-xs md:text-xs lg:text-sm"
                    : "text-sm md:text-sm lg:text-lg"
                } break-words text-center w-full overflow-hidden`}
                >
                {name}
                </div>
                <div className="text-yellow-400 text-2xl md:text-2xl lg:text-3xl font-bold">
                {score}
                </div>
            </div>
            </div>
        </div>
        ))}
      </div>
      {showInvalidTimestampPopup && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => setShowInvalidTimestampPopup(false)}
        >
          <div className="bg-red-800/90 text-yellow-100 px-6 py-4 rounded-lg border border-red-600 shadow-lg max-w-xs text-center">
            <p>{invalidTimestampMessage}</p>
            <p className="text-sm mt-1 text-yellow-200/80">
              Click anywhere to dismiss
            </p>
          </div>
        </div>
      )}
      {showScoreboardModal && (
        <ScoreModal isOpen={showScoreboardModal} onClose={() => setShowScoreboardModal(false)} />
        )}
    </div>
    </div>
    </div>
  );
}


export default MovieGame
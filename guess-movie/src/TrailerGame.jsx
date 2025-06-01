import React, { useState, useEffect, useCallback, useRef } from 'react';
import YouTube from 'react-youtube';
import ScoreModal from './ScoreModal';
// import { useScores } from './ScoreContext';

const TrailerGame = ({ onNavigateHome }) => {
  // State for movies data
  const [movies, setMovies] = useState([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // YouTube player state
  const [player, setPlayer] = useState(null);
  const [videoId, setVideoId] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  
  // Game state
  const [hideVideo, setHideVideo] = useState(true);
  const [hideInfo, setHideInfo] = useState(true);
  const [showScores, setShowScores] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [holdTimestamp, setHoldTimestamp] = useState(null);
  const [customTimestamp, setCustomTimestamp] = useState('');
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [activeDuration, setActiveDuration] = useState(null);
  const [activeTimestampControl, setActiveTimestampControl] = useState(null);
  
  // Add a key to force YouTube component re-render
  const [playerKey, setPlayerKey] = useState(0);
  
  // Reference to interval for clearing
  const playIntervalRef = useRef(null);

  const gameMode = localStorage.getItem('selectedGameMode') || 'union';

  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);
  
  // Extract YouTube video ID from a URL
  const extractVideoId = useCallback((url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }, []);
  
useEffect(() => {
  const fetchMovies = async () => {
    try {
      const selectedQuarter = localStorage.getItem('selectedQuarter') || 'Q1';
      console.log(`Fetching movies for game mode: ${gameMode}, quarter: ${selectedQuarter}`);
      let endpoint;
        switch(gameMode) {
          case 'union':
            endpoint = '/data/movies.json';
            break;
          case 'split':
            endpoint = `/split/TrailerGame${selectedQuarter}.json`;
            break;
          case 'tutorial':
            endpoint = '/tutorial/TrailerGame.json';
            break;
          default:
            endpoint = '/data/movies.json';
        }
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch movie data');
      }
      
      // Get the data and shuffle it immediately
      const data = await response.json();
      const shuffledMovies = shuffleArray([...data]);
      
      setMovies(shuffledMovies);
      setLoading(false);
      
      // Set initial video ID from the first shuffled movie
      if (shuffledMovies.length > 0) {
        const id = extractVideoId(shuffledMovies[0].trailer);
        setVideoId(id);
        // HELPER CONSOLE
        console.log('Initial movie loaded:', {
          title: shuffledMovies[0].title,
          year: shuffledMovies[0].year
        });
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  fetchMovies();
}, [extractVideoId]);
  
  const onReady = (event) => {
    setPlayer(event.target);
    setVideoDuration(event.target.getDuration());
    // Pause video initially
    event.target.pauseVideo();
  };

  const muteTemporarily = useCallback(() => {
    if (player) {

      player.mute();
      
      setTimeout(() => {
        player.unMute();
      }, 2000);
    }
  }, [player]);
  
  // Handle state changes in YouTube player
  const onStateChange = (event) => {
    // Video ended
    if (event.data === 0) {
      setIsPlaying(false);
      setActiveDuration(null);
    }
    
    // Update current timestamp during playback
    if (event.data === 1) { // playing
      // Only allow playing if we explicitly requested it
      // If we're not expecting the video to be playing, pause it
      if (!isPlaying) {
        player?.pauseVideo();
        return;
      }
      // if (isPlaying) {
      //   setIsPlaying(true);
      // }
    //   setIsPlaying(true);
      const updateTimestamp = () => {
        if (player) {
          setCurrentTimestamp(Math.floor(player.getCurrentTime()));
        }
      };
      updateTimestamp();
      const interval = setInterval(updateTimestamp, 1000);
      playIntervalRef.current = interval;
      return () => clearInterval(interval);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
      if (event.data === 2) { // paused
        setIsPlaying(false);
        setActiveDuration(null);
      }
    }
  };

  // Play button handler
  const handlePlay = () => {
    if (player) {
      player.playVideo();
      setIsPlaying(true);
    }
  };
  
  // Pause button handler
  const handlePause = () => {
    if (player) {
      player.pauseVideo();
      setIsPlaying(false);
    }
  };
  
  // Play for a specific duration
  const playFor = (seconds) => {
    if (player) {
      // If repeat is not enabled, start from current position
      // If repeat is enabled, restart from the remembered position
      if (repeatEnabled && activeTimestampControl && holdTimestamp) {
        // Go back to the last set timestamp position before playing
        player.seekTo(holdTimestamp, true);
      }
      
      player.playVideo();
      setIsPlaying(true);
      setActiveDuration(seconds);
      
      setTimeout(() => {
        player.pauseVideo();
        setIsPlaying(false);
        setActiveDuration(null);
      }, seconds * 1000);
    }
  };
  
  // Go to a custom timestamp
  const goToTimestamp = () => {
    muteTemporarily();
    if (player && customTimestamp !== '') {
      const time = parseInt(customTimestamp, 10);
      if (!isNaN(time) && time >= 0 && time < videoDuration) {
        muteTemporarily();
        
        // First pause the video to ensure it doesn't start playing
        player.pauseVideo();
        setIsPlaying(false);
        player.seekTo(time, true);
        setCurrentTimestamp(time);
        setHoldTimestamp(time);
        setActiveTimestampControl('go');

        // Add this log for timestamp change
        console.log('Jumped to timestamp:', {
            time: formatTime(time),
            movie: currentMovie.title
        });
      }
    }
  };
  
  // Go to a random timestamp
  const goToRandomTimestamp = () => {
    // muteTemporarily();
    if (player && videoDuration > 0) {
      // First pause the video to ensure it doesn't start playing
      player.pauseVideo();
      setIsPlaying(false);
      
      muteTemporarily();
      // Avoid the first and last 10% of the video
      const minTime = Math.floor(videoDuration * 0.1);
      const maxTime = Math.floor(videoDuration * 0.9);
      const randomTime = Math.floor(Math.random() * (maxTime - minTime)) + minTime;
      
      player.seekTo(randomTime, true);
      setCurrentTimestamp(randomTime);
      setHoldTimestamp(randomTime);
      setActiveTimestampControl('random');

      // Add this log for timestamp change
      console.log('Random timestamp:', {
        time: formatTime(randomTime),
        movie: currentMovie.title
      });
    }
  };
  
  // Modified nextMovie function
  const nextMovie = () => {
    if (player) {
      player.pauseVideo();
    }
    
    setIsPlaying(false);
    setHideVideo(true);
    setHideInfo(true);
    
    // Check if we're at the end of our movie list
    if (currentMovieIndex === movies.length - 1) {
      // Reshuffle all movies except the current one for a fresh order
      const currentMovie = movies[currentMovieIndex];
      const moviesWithoutCurrent = movies.filter(movie => movie !== currentMovie);
      const newShuffledMovies = shuffleArray(moviesWithoutCurrent);
      
      // Add the current movie at the end to ensure it isn't shown twice in a row
      const newMovieList = [...newShuffledMovies, currentMovie];
      
      // Reset to the first movie in the new shuffled list
      setMovies(newMovieList);
      setCurrentMovieIndex(0);
      
      const nextVideoId = extractVideoId(newMovieList[0].trailer);
      setVideoId(nextVideoId);
      
      // Increment player key to force re-render
      setPlayerKey(prevKey => prevKey + 1);
      
      // HELP CONSOLE MOVIE DATE AND NAME
      console.log(`Next movie loaded (reshuffled): ${newMovieList[0].title} (${newMovieList[0].year})`);
    } else {
      // Standard next movie behavior
      const nextIndex = currentMovieIndex + 1;
      setCurrentMovieIndex(nextIndex);
      
      const nextVideoId = extractVideoId(movies[nextIndex].trailer);
      setVideoId(nextVideoId);
      
      // Increment player key to force re-render
      setPlayerKey(prevKey => prevKey + 1);
      
      // HELP CONSOLE MOVIE DATE AND NAME
      console.log(`Next movie loaded: ${movies[nextIndex].title} (${movies[nextIndex].year})`);
    }
    
    setCurrentTimestamp(0);
    setCustomTimestamp('');
    // Reset player state
    setPlayer(null);
    setVideoDuration(0);
  };
  
  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Current movie
  const currentMovie = movies[currentMovieIndex] || {};
  
  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-green-500">Loading...</div>;
  if (error) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500">Error: {error}</div>;
  
  return (
    <div className="w-screen bg-black">
      <div className="w-full flex justify-center">

            <div className="min-h-screen w-full bg-black text-green-500 p-6 flex flex-col">
            <div className="w-[72vw] mx-auto flex-grow">
                {/* Regular header for screens below 2xl */}
                <header className="flex justify-between items-center mb-6 2xl:hidden">
                  <h1 className="text-3xl font-bold">Movie Trailer Guessing Game</h1>
                  <div className="flex gap-4">
                    <button 
                    onClick={() => setShowScores(true)}
                    className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                    Scores
                    </button>
                    <button 
                    onClick={onNavigateHome}
                    className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                    Home
                    </button>
                  </div>
                </header>

                {/* Custom header for 2xl screens and above with movie info inline */}
                <header className="hidden 2xl:flex flex-row justify-between items-center mb-6">
                  <button 
                  className="text-3xl font-bold"
                  onClick={onNavigateHome}
                  >Movie Trailer Guessing Game</button>
                  
                  
                  <div className="flex gap-4">
                                      {/* Movie info section integrated in top bar for 2xl+ */}
                  <div className="flex items-center">
                    {hideInfo ? (
                      <button 
                        onClick={() => setHideInfo(false)}
                        className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Show Info
                      </button>
                    ) : (
                      <div className="bg-gray-900 px-5 rounded flex items-center">
                        <div className="flex gap-6">
                          <p><strong>Title:</strong> {currentMovie.title}</p>
                          <p><strong>Year:</strong> {currentMovie.year}</p>
                          <p><strong>Current Time:</strong> {formatTime(currentTimestamp)}</p>
                        </div>
                        <button 
                          onClick={() => setHideInfo(true)}
                          className="bg-green-800 text-white px-4 -mr-5 py-2 rounded hover:bg-green-700"
                        >
                          Hide Info
                        </button>
                      </div>
                    )}
                  </div>
                    <button 
                    onClick={() => setShowScores(true)}
                    className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                    Scores
                    </button>
                    <button 
                    onClick={onNavigateHome}
                    className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                    Home
                    </button>
                  </div>
                </header>
                
                <div className="mb-4 relative">
                <div className="aspect-video bg-gray-900 rounded overflow-hidden">
                    {hideVideo && (
                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center z-10">
                        <span className="text-xl">Video Hidden</span>
                    </div>
                    )}
                    <div className="w-full h-full">
                    <YouTube
                        key={playerKey} // Add key prop to force re-render
                        videoId={videoId}
                        opts={{
                        width: '100%',
                        height: '100%',
                        playerVars: {
                            controls: 0,
                            disablekb: 1,
                            modestbranding: 1,
                            rel: 0,
                            showinfo: 0,
                            iv_load_policy: 3, // Hide video annotations
                            autoplay: 0, // Ensure autoplay is off
                            playsinline: 1
                        }
                        }}
                        onReady={onReady}
                        onStateChange={onStateChange}
                        className="w-full h-full"
                    />
                    </div>
                </div>
                </div>
                
                {/* Movie info section - only show for screens below 2xl */}
                <div className="bg-gray-900 p-4 rounded mb-6 2xl:hidden">
                <div className="flex justify-between mb-2">
                    <h3 className="text-lg">Movie Info</h3>
                    <button 
                    onClick={() => setHideInfo(!hideInfo)}
                    className="bg-green-800 text-white px-3 py-1 rounded text-sm"
                    >
                    {hideInfo ? 'Show Info' : 'Hide Info'}
                    </button>
                </div>
                
                {!hideInfo && (
                    <div>
                    <p><strong>Title:</strong> {currentMovie.title}</p>
                    <p><strong>Year:</strong> {currentMovie.year}</p>
                    <p><strong>Current Time:</strong> {formatTime(currentTimestamp)}</p>
                    </div>
                )}
                </div>
            </div>
            
            {/* Controls section - reorganized for xl screens */}
            <div className="max-w-6xl mx-auto w-full mt-auto">
                {/* For mobile to lg screens - stack vertically as before */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:hidden gap-6 mb-6">
                <div>
                    <h2 className="text-xl mb-2">Video Controls</h2>
                    <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={handlePlay}
                        disabled={isPlaying}
                        className="bg-green-700 text-white px-4 py-2 rounded disabled:bg-gray-700"
                    >
                        Play
                    </button>
                    <button 
                        onClick={handlePause}
                        disabled={!isPlaying}
                        className="bg-red-700 text-white px-4 py-2 rounded disabled:bg-gray-700"
                    >
                        Pause
                    </button>
                    <button 
                        onClick={() => setHideVideo(!hideVideo)}
                        className={`${hideVideo ? 'bg-green-700' : 'bg-red-700'} text-white px-4 py-2 rounded`}
                    >
                        {hideVideo ? 'Show Video' : 'Hide Video'}
                    </button>
                    </div>
                    
                    <h3 className="text-lg mt-4 mb-2">Play for:</h3>
                    <div className="flex flex-wrap gap-2">
                    {[1, 3, 5, 10].map(seconds => (
                        <button 
                        key={seconds}
                        onClick={() => {playFor(seconds);}}
                        className={`${activeDuration === seconds ? 'bg-green-500' : 'bg-green-800'} text-white px-4 py-2 rounded hover:bg-green-700`}
                        >
                        {seconds}s
                        </button>
                    ))}
                    </div>
                </div>
                
                <div>
                    <h2 className="text-xl mb-2">Timestamp Controls</h2>
                    <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={customTimestamp}
                        onChange={(e) => setCustomTimestamp(e.target.value)}
                        placeholder="Seconds"
                        className="bg-gray-800 text-white px-2 py-1 rounded w-24"
                    />
                    <button 
                        onClick={goToTimestamp}
                        className={`${activeTimestampControl === 'go' ? 'bg-green-500' : 'bg-green-700'} text-white px-4 py-1 rounded`}
                    >
                        Go
                    </button>
                    <button 
                        onClick={goToRandomTimestamp}
                        className={`${activeTimestampControl === 'random' ? 'bg-green-500' : 'bg-green-700'} text-white px-4 py-1 rounded`}
                    >
                        Random
                    </button>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                    <button
                        onClick={() => setRepeatEnabled(!repeatEnabled)}
                        className={`${repeatEnabled ? 'bg-green-500' : 'bg-gray-700'} text-white px-4 py-1 rounded`}
                    >
                        Repeat {repeatEnabled ? 'On' : 'Off'}
                    </button>
                    <span className="text-sm text-gray-400">
                        {repeatEnabled ? 'Video will restart from the same timestamp' : 'Video will continue from where it stopped'}
                    </span>
                    </div>
                </div>
                </div>
                
                {/* For xl screens - linear layout at bottom */}
                <div className="hidden xl:flex flex-col bg-gray-900 rounded-lg p-4 mb-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    {/* Video controls group */}
                    <div className="flex flex-col">
                    <h2 className="text-lg mb-2">Video Controls</h2>
                    <div className="flex gap-2">
                        <button 
                        onClick={handlePlay}
                        disabled={isPlaying}
                        className="bg-green-700 text-white px-4 py-2 rounded disabled:bg-gray-700"
                        >
                        Play
                        </button>
                        <button 
                        onClick={handlePause}
                        disabled={!isPlaying}
                        className="bg-red-700 text-white px-4 py-2 rounded disabled:bg-gray-700"
                        >
                        Pause
                        </button>
                        <button 
                        onClick={() => setHideVideo(!hideVideo)}
                        className={`${hideVideo ? 'bg-green-700' : 'bg-red-700'} text-white px-4 py-2 rounded`}
                        >
                        {hideVideo ? 'Show Video' : 'Hide Video'}
                        </button>
                    </div>
                    </div>
                    
                    {/* Duration controls group */}
                    <div className="flex flex-col">
                    <h3 className="text-lg mb-2">Play for:</h3>
                    <div className="flex gap-2">
                        {[1, 3, 5, 10].map(seconds => (
                        <button 
                            key={seconds}
                            onClick={() => {playFor(seconds);}}
                            className={`${activeDuration === seconds ? 'bg-green-500' : 'bg-green-800'} text-white px-4 py-2 rounded hover:bg-green-700`}
                        >
                            {seconds}s
                        </button>
                        ))}
                    </div>
                    </div>
                    
                    {/* Timestamp controls group */}
                    <div className="flex flex-col">
                    <h3 className="text-lg mb-2">Timestamp:</h3>
                    <div className="flex gap-2">
                        <input
                        type="text"
                        value={customTimestamp}
                        onChange={(e) => setCustomTimestamp(e.target.value)}
                        placeholder="Seconds"
                        className="bg-gray-800 text-white px-2 py-1 rounded w-24"
                        />
                        <button 
                        onClick={goToTimestamp}
                        className={`${activeTimestampControl === 'go' ? 'bg-green-500' : 'bg-green-700'} text-white px-4 py-1 rounded`}
                        >
                        Go
                        </button>
                        <button 
                        onClick={goToRandomTimestamp}
                        className={`${activeTimestampControl === 'random' ? 'bg-green-500' : 'bg-green-700'} text-white px-4 py-1 rounded`}
                        >
                        Random
                        </button>
                    </div>
                    </div>
                    
                    {/* Repeat control */}
                    <div className="flex flex-col">
                    <h3 className="text-lg mb-2">Repeat:</h3>
                    <button
                        onClick={() => setRepeatEnabled(!repeatEnabled)}
                        className={`${repeatEnabled ? 'bg-green-500' : 'bg-gray-700'} text-white px-4 py-1 rounded`}
                    >
                        {repeatEnabled ? 'On' : 'Off'}
                    </button>
                    </div>
                    
                    {/* Next movie button */}
                    <div className="flex flex-col">
                    <h3 className="text-lg mb-2">Next:</h3>
                    <button 
                        onClick={nextMovie}
                        className="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-600"
                    >
                        Next Movie
                    </button>
                    </div>
                </div>
                </div>
                
                {/* Next movie button for smaller screens */}
                <div className="flex justify-end xl:hidden">
                <button 
                    onClick={nextMovie}
                    className="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-600 text-lg"
                >
                    Next Movie
                </button>
                </div>
            </div>
            
            <ScoreModal
                isOpen={showScores}
                onClose={() => setShowScores(false)}
            />
            </div>
      </div>
    </div>
  );
};

export default TrailerGame;
// WARNING: This code will NOT work in Claude.ai artifacts
// Use this only in your own development environment

import React, { createContext, useContext, useState, useEffect } from 'react';

const GameProgressContext = createContext();

export const useGameProgress = () => {
  const context = useContext(GameProgressContext);
  if (!context) {
    throw new Error('useGameProgress must be used within a GameProgressProvider');
  }
  return context;
};

export const GameProgressProvider = ({ children }) => {
  // Initialize from localStorage or defaults
  const getStoredValue = (key, defaultValue) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? parseInt(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [imageIndex, setImageIndex] = useState(() => getStoredValue('gameImageIndex', 1));
  const [videoIndex, setVideoIndex] = useState(() => getStoredValue('gameVideoIndex', 1));
  const [imageCount, setImageCount] = useState(() => getStoredValue('gameImageCount', 100));
  const [videoCount, setVideoCount] = useState(() => getStoredValue('gameVideoCount', 100));

  // Save to localStorage whenever values change
  useEffect(() => {
    localStorage.setItem('gameImageIndex', imageIndex.toString());
  }, [imageIndex]);

  useEffect(() => {
    localStorage.setItem('gameVideoIndex', videoIndex.toString());
  }, [videoIndex]);

  useEffect(() => {
    localStorage.setItem('gameImageCount', imageCount.toString());
  }, [imageCount]);

  useEffect(() => {
    localStorage.setItem('gameVideoCount', videoCount.toString());
  }, [videoCount]);

  const incrementImageIndex = () => {
    setImageIndex(prev => Math.min(prev + 1, imageCount));
  };

  const decrementImageIndex = () => {
    setImageIndex(prev => Math.max(prev - 1, 1));
  };

  const incrementVideoIndex = () => {
    setVideoIndex(prev => Math.min(prev + 1, videoCount));
  };

  const decrementVideoIndex = () => {
    setVideoIndex(prev => Math.max(prev - 1, 1));
  };

  const resetImageProgress = () => {
    setImageIndex(1);
  };

  const resetVideoProgress = () => {
    setVideoIndex(1);
  };

  const resetAllProgress = async () => {
    setImageIndex(1);
    setVideoIndex(1);
    
    try {
      const ImageEndpoint = "/data/data2.json";
      const VideoEndpoint = "/data/data.json";
      
      const ImageResponse = await fetch(ImageEndpoint);
      const VideoResponse = await fetch(VideoEndpoint);
      
      const ImageData = await ImageResponse.json();
      const VideoData = await VideoResponse.json();
      
      const ImageCount = ImageData.length;
      const VideoCount = VideoData.length;
      
      setImageCount(ImageCount);
      setVideoCount(VideoCount);
      
      console.log(`${ImageCount} images and ${VideoCount} videos`);
    } catch (error) {
      console.error('Json files did not load:', error);
      setImageCount(99);
      setVideoCount(99);
    }
  };

  const clearStoredProgress = () => {
    localStorage.removeItem('gameImageIndex');
    localStorage.removeItem('gameVideoIndex');
    localStorage.removeItem('gameImageCount');
    localStorage.removeItem('gameVideoCount');
    resetAllProgress();
  };

  const value = {
    imageIndex,
    videoIndex,
    imageCount,
    videoCount,
    
    setImageIndex,
    setVideoIndex,
    setImageCount,
    setVideoCount,
    
    incrementImageIndex,
    decrementImageIndex,
    incrementVideoIndex,
    decrementVideoIndex,
    resetImageProgress,
    resetVideoProgress,
    resetAllProgress,
    clearStoredProgress, // New method to clear all stored data
  };

  return (
    <GameProgressContext.Provider value={value}>
      {children}
    </GameProgressContext.Provider>
  );
};
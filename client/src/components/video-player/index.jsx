import { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import PropTypes from "prop-types";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import gsap from "gsap";

function VideoPlayer({
  width = "100%",
  height = "100%",
  url,
  onVideoEnded = () => {},
}) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const controlsRef = useRef(null); // Ref for controls div

  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function handlePlayAndPause() {
    const next = !playing;
    setPlaying(next);
    // When switching to play, hide the center control quickly
    if (next) {
      setTimeout(() => setShowControls(false), 120);
    } else {
      // When pausing, keep controls visible
      setShowControls(true);
    }
  }

  function handleProgress(state) {
    if (!seeking) {
      setPlayed(state.played);
      setCurrentTime(state.playedSeconds);
    }
    // Do not clear buffering indicator while offline
    if (!isOffline) {
      setIsBuffering(false);
    }
  }

  function handleDuration(newDuration) {
    setDuration(newDuration);
  }

  function handleVideoEnded() {
    console.log("Video ended - calling onVideoEnded callback");
    if (onVideoEnded && typeof onVideoEnded === 'function') {
      onVideoEnded();
    }
  }


  function handleRewind() {
    const currentTime = playerRef?.current?.getCurrentTime();
    if (currentTime && isFinite(currentTime)) {
      playerRef?.current?.seekTo(currentTime - 5);
    }
  }

  function handleForward() {
    const currentTime = playerRef?.current?.getCurrentTime();
    if (currentTime && isFinite(currentTime)) {
      playerRef?.current?.seekTo(currentTime + 5);
    }
  }

  function handleToggleMute() {
    setMuted(!muted);
  }

  function handleSeekChange(newValue) {
    const seekValue = newValue[0];
    if (isFinite(seekValue)) {
      setPlayed(seekValue);
      setCurrentTime(seekValue * duration);
    }
    setSeeking(true);
  }

  function handleSeekMouseUp() {
    setSeeking(false);
    if (isFinite(played)) {
      playerRef.current?.seekTo(played);
      setCurrentTime(played * duration);
    }
  }

  function handleVolumeChange(newValue) {
    const volumeValue = newValue[0];
    if (isFinite(volumeValue)) {
      setVolume(volumeValue);
    }
  }



  const handleFullScreen = useCallback(() => {
    if (!isFullScreen) {
      if (playerContainerRef?.current?.requestFullscreen) {
        playerContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullScreen]);

  function handleMouseMove() {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 4000);
  }

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    const onlineListener = () => setIsOffline(false);
    const offlineListener = () => setIsOffline(true);
    window.addEventListener('online', onlineListener);
    window.addEventListener('offline', offlineListener);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      window.removeEventListener('online', onlineListener);
      window.removeEventListener('offline', offlineListener);
    };
  }, []);

  useEffect(() => {
    // Animate controls visibility with a more pronounced effect
    if (controlsRef.current) {
      gsap.to(controlsRef.current, {
        opacity: showControls ? 1 : 0,
        y: showControls ? 0 : 20, // Slide up/down effect
        scale: showControls ? 1 : 0.98, // Slight scale effect
        duration: 0.3,
        ease: "power2.out",
        pointerEvents: showControls ? "auto" : "none",
      });
    }
  }, [showControls]);


  // Reset progress when URL changes (new lecture)
  useEffect(() => {
    setPlayed(0);
    setCurrentTime(0);
    console.log("Video URL changed, resetting progress to 0");
    // Auto-play on new URL (when a lecture is selected)
    if (url) {
      setPlaying(true);
    }
  }, [url]);

  // Auto-resume when coming back online
  useEffect(() => {
    if (isOffline) {
      // Force buffering UI and pause playback when offline
      setIsBuffering(true);
      setPlaying(false);
    } else if (url) {
      setIsBuffering(false);
      setPlaying(true);
    }
  }, [isOffline, url]);

  return (
    <div
      ref={playerContainerRef}
      className={`relative bg-black rounded-lg shadow-2xl transition-all duration-300 ease-in-out group
      ${isFullScreen ? "w-screen h-screen" : ""}
      `}
      style={{ width, height, overflow: 'hidden' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
      onTouchStart={() => setShowControls(true)}
    >
      <ReactPlayer
        ref={playerRef}
        className="absolute top-0 left-0"
        width="100%"
        height="100%"
        url={url}
        playing={playing}
        volume={volume}
        muted={muted}
        onBuffer={() => setIsBuffering(true)}
        onBufferEnd={() => !isOffline && setIsBuffering(false)}
        onError={() => setIsBuffering(true)}
        onStart={() => !isOffline && setIsBuffering(false)}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onEnded={handleVideoEnded}
        config={{
          file: {
            attributes: {
              playsInline: true,
            },
          },
        }}
      />
      {/* Center play/pause control - appears when controls are shown (mouse move/touch) */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: showControls ? 1 : 0, transition: "opacity 200ms ease" }}
        onMouseMove={handleMouseMove}
      >
        <button
          type="button"
          onClick={handlePlayAndPause}
          className="pointer-events-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/80 hover:bg-white focus:outline-none shadow-md flex items-center justify-center"
          aria-label={playing ? "Pause video" : "Play video"}
        >
          {playing ? (
            <Pause className="h-6 w-6 sm:h-7 sm:w-7 text-black" />
          ) : (
            <Play className="h-6 w-6 sm:h-7 sm:w-7 text-black" />
          )}
        </button>
      </div>
      {/* Center overlay for buffering/offline */}
      {(isBuffering || isOffline) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 select-none" aria-live="polite">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border-4 border-white/60 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-white text-xs sm:text-sm font-medium">
              {isOffline ? 'You are offline. Reconnecting…' : 'Loading…'}
            </div>
          </div>
        </div>
      )}
      <div
        ref={controlsRef}
        className={`absolute bottom-0 left-0 right-0 px-2 sm:px-3 py-2 sm:py-3 pb-3 sm:pb-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent transition-opacity duration-200 ease-in-out`}
        style={{ opacity: showControls ? 1 : 0, pointerEvents: showControls ? "auto" : "none" }}
      >
        <Slider
          value={[played * 100]}
          max={100}
          step={0.1}
          onValueChange={(value) => handleSeekChange([value[0] / 100])}
          onValueCommit={handleSeekMouseUp}
          className="w-full mb-1.5 sm:mb-2 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-runnable-track]:bg-gray-600 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 sm:[&::-webkit-slider-thumb]:h-4 sm:[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:touch-manipulation"
        />
        <div className="flex items-center justify-between w-full gap-0.5 sm:gap-1">
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayAndPause}
              className="text-white hover:bg-white/20 transition-colors duration-200 h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 p-0"
            >
              {playing ? (
                <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <Play className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>
            <Button
              onClick={handleRewind}
              className="text-white hover:bg-white/20 transition-colors duration-200 h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 p-0"
              variant="ghost"
              size="icon"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              onClick={handleForward}
              className="text-white hover:bg-white/20 transition-colors duration-200 h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 p-0"
              variant="ghost"
              size="icon"
            >
              <RotateCw className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              onClick={handleToggleMute}
              className="text-white hover:bg-white/20 transition-colors duration-200 h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 p-0"
              variant="ghost"
              size="icon"
            >
              {muted ? (
                <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>
            <div className="hidden md:block flex-shrink-0">
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                onValueChange={(value) => handleVolumeChange([value[0] / 100])}
                className="w-16 sm:w-20 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-runnable-track]:bg-gray-600 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 sm:[&::-webkit-slider-thumb]:h-4 sm:[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:touch-manipulation"
              />
            </div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0 ml-auto">
            <div className="text-white text-[9px] sm:text-[10px] font-mono whitespace-nowrap px-1">
              {formatTime(currentTime)}/{formatTime(duration)}
            </div>
            <Button
              className="text-white hover:bg-white/20 transition-colors duration-200 h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 p-0"
              variant="ghost"
              size="icon"
              onClick={handleFullScreen}
              title={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullScreen ? (
                <Minimize className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

VideoPlayer.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  url: PropTypes.string,
  onVideoEnded: PropTypes.func,
};

export default VideoPlayer;
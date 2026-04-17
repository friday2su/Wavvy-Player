'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import VideoControls from './VideoControls';
import { detectVideoType, formatTime, initializeHlsPlayer, cleanupVideoSource } from './utils';
import type { VideoPlayerProps, VideoState } from './types';

export default function VideoPlayer({
  src,
  type = 'auto',
  poster,
  className = '',
  onVideoChange
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const [state, setState] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    bufferedEnd: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    error: null,
    showControls: true,
  });

  const videoType = detectVideoType(src, type);

  // Initialize HLS or regular video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Clean up previous video source
    cleanupVideoSource(hlsRef, video);

    // Reset state
    setState(prev => ({
      ...prev,
      error: null,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
    }));

    if (videoType === 'hls') {
      const hls = initializeHlsPlayer(src, video, (error) => {
        setState(prev => ({ ...prev, error }));
      });
      hlsRef.current = hls;
    } else {
      // MP4 or other formats
      video.src = src;
    }

    return () => {
      cleanupVideoSource(hlsRef, video);
    };
  }, [src, videoType]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const bufferedEnd = video.buffered.length > 0 ? video.buffered.end(video.buffered.length - 1) : 0;
      setState(prev => ({
        ...prev,
        currentTime: video.currentTime,
        bufferedEnd
      }));
    };
    const handleDurationChange = () => setState(prev => ({ ...prev, duration: video.duration }));
    const handlePlay = () => setState(prev => ({ ...prev, isPlaying: true }));
    const handlePause = () => setState(prev => ({ ...prev, isPlaying: false }));
    const handleVolumeChange = () => setState(prev => ({
      ...prev,
      volume: video.volume,
      isMuted: video.muted
    }));

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('progress', handleTimeUpdate); // Update buffered end on progress events

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setState(prev => ({ ...prev, isFullscreen: !!document.fullscreenElement }));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Controls are always visible - no auto-hide functionality

  // Control functions
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (state.isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = time;
    setState(prev => ({ ...prev, currentTime: time }));
  };

  const handleVolumeChange = (volume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = volume;
    setState(prev => ({
      ...prev,
      volume,
      isMuted: volume === 0 ? true : prev.isMuted
    }));

    if (volume > 0 && state.isMuted) {
      video.muted = false;
      setState(prev => ({ ...prev, isMuted: false }));
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !state.isMuted;
    video.muted = newMuted;
    setState(prev => ({ ...prev, isMuted: newMuted }));
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!state.isFullscreen) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.max(0, video.currentTime - 10);
    video.currentTime = newTime;
    setState(prev => ({ ...prev, currentTime: newTime }));
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.min(video.duration, video.currentTime + 10);
    video.currentTime = newTime;
    setState(prev => ({ ...prev, currentTime: newTime }));
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (video !== document.pictureInPictureElement) {
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP failed:', error);
    }
  };

  const sampleVideos = [
    {
      name: 'HLS Stream',
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      type: 'hls' as const
    },
    {
      name: 'MP4 Video',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'mp4' as const
    }
  ];

  const [showVideoMenu, setShowVideoMenu] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  return (
    <div
      className={`relative bg-black overflow-hidden ${className}`}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={poster}
        onClick={togglePlay}
        playsInline
      />

      {state.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-4">
          <div className="text-center">
            <div className="text-xl mb-2">⚠️</div>
            <div>{state.error}</div>
          </div>
        </div>
      )}

      {/* Server/Video Switcher Icon - Top Left Corner */}
      <div className="absolute top-2 left-2 z-20">
        <button
          onClick={() => setShowVideoMenu(!showVideoMenu)}
          className="bg-black/60 text-white p-1.5 rounded-lg backdrop-blur-sm cursor-pointer"
          aria-label="Video options"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" d="M14.381 9.027a5.8 5.8 0 0 1 1.905-.321c.654 0 1.283.109 1.87.309m-11.04 2.594a4.4 4.4 0 0 0-.83-.08C3.919 11.53 2 13.426 2 15.765S3.919 20 6.286 20h10C19.442 20 22 17.472 22 14.353c0-2.472-1.607-4.573-3.845-5.338M7.116 11.609a5.6 5.6 0 0 1-.354-1.962C6.762 6.528 9.32 4 12.476 4c2.94 0 5.361 2.194 5.68 5.015m-11.04 2.594a4.3 4.3 0 0 1 1.55.634"/>
          </svg>
        </button>

        {/* Video Options Menu */}
        {showVideoMenu && (
          <div className="absolute top-12 left-0 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom-2 duration-300 min-w-[300px] max-w-sm overflow-hidden z-50">
            <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="p-4 pt-6">
                {/* Header */}
                <div className="mb-4 px-2">
                  <h3 className="text-white font-semibold text-base">Video Sources</h3>
                  <div className="h-px bg-white/10 mt-2"></div>
                </div>
                <div className="space-y-1">
                  {sampleVideos.map((video, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (onVideoChange) {
                          onVideoChange(video.url);
                          setShowVideoMenu(false);
                        }
                      }}
                      className="w-full text-left px-3 py-2.5 text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        video.type === 'hls' ? 'bg-blue-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{video.name}</div>
                        <div className="text-xs text-white/40">{video.type.toUpperCase()}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10 my-4"></div>

                {/* Custom URL Input */}
                <div className="px-2">
                  <div className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">Custom URL</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="Enter m3u8 or mp4 URL"
                      className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/15 transition-all"
                    />
                    <button
                      onClick={() => {
                        if (customUrl.trim() && onVideoChange) {
                          onVideoChange(customUrl.trim());
                          setShowVideoMenu(false);
                          setCustomUrl('');
                        }
                      }}
                      className="bg-blue-500/80 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                      Play
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls Background - Only visible before first play */}
      {!state.isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pointer-events-none"></div>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0">
        <VideoControls
          ref={controlsRef}
          isPlaying={state.isPlaying}
          currentTime={state.currentTime}
          duration={state.duration}
          bufferedEnd={state.bufferedEnd}
          volume={state.volume}
          isMuted={state.isMuted}
          isFullscreen={state.isFullscreen}
          videoElement={videoRef.current}
          onPlayPause={togglePlay}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onToggleMute={toggleMute}
          onToggleFullscreen={toggleFullscreen}
          onSkipBackward={skipBackward}
          onSkipForward={skipForward}
          onTogglePiP={togglePiP}
          formatTime={formatTime}
        />
      </div>


    </div>
  );
}

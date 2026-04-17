'use client';

import { forwardRef, useState } from 'react';
import type { VideoControlsProps } from './types';

const VideoControls = forwardRef<HTMLDivElement, VideoControlsProps & { showControls?: boolean }>(({
  isPlaying,
  currentTime,
  duration,
  bufferedEnd,
  volume,
  isMuted,
  isFullscreen,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleFullscreen,
  onSkipBackward,
  onSkipForward,
  onTogglePiP,
  formatTime,
}, ref) => {
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    onSeek(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    onVolumeChange(vol);
  };

  const [showSettings, setShowSettings] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState('Auto');
  const [selectedSpeed, setSelectedSpeed] = useState('1x');
  const [captionsEnabled, setCaptionsEnabled] = useState(false);

  const handleButtonClick = (callback: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    callback();
  };

  const qualities = ['Auto', '1080p', '720p', '480p', '360p', '240p'];
  const speeds = ['0.25x', '0.5x', '0.75x', '1x', '1.25x', '1.5x', '1.75x', '2x', '2.5x', '3x'];
  const captionLanguages = ['Off', 'English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Chinese'];
  const captionSizes = ['Small', 'Medium', 'Large', 'Extra Large'];

  return (
    <div
      ref={ref}
      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-300"
    >
      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="relative">
          <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-1.5 bg-white/20 rounded-full"></div>
          <div 
            className="absolute inset-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full"
            style={{ 
              width: `${(bufferedEnd / duration) * 100}%`,
              background: 'rgba(255,255,255,0.3)'
            }}
          ></div>
          <div 
            className="absolute inset-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full"
            style={{ 
              width: `${(currentTime / duration) * 100}%`,
              background: 'linear-gradient(90deg, #3b82f6, #60a5fa)'
            }}
          ></div>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-6 cursor-pointer bg-transparent z-10"
            style={{ WebkitAppearance: 'none', appearance: 'none' }}
          />
          <style>{`
            input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 0; height: 0; }
            input[type="range"]::-moz-range-thumb { border: none; width: 0; height: 0; }
          `}</style>
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg pointer-events-none"
            style={{ 
              left: `calc(${(currentTime / duration) * 100}% - 6px)`,
              opacity: 1
            }}
          ></div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Left Side Controls */}
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <button
            onClick={handleButtonClick(onPlayPause)}
            className="cursor-pointer text-white/80 hover:text-white transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                <path fill="currentColor" d="M2 6c0-1.886 0-2.828.586-3.414S4.114 2 6 2s2.828 0 3.414.586S10 4.114 10 6v12c0 1.886 0 2.828-.586 3.414S7.886 22 6 22s-2.828 0-3.414-.586S2 19.886 2 18zm12 0c0-1.886 0-2.828.586-3.414S16.114 2 18 2s2.828 0 3.414.586S22 4.114 22 6v12c0 1.886 0 2.828-.586 3.414S19.886 22 18 22s-2.828 0-3.414-.586S14 19.886 14 18z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                <path fill="currentColor" d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"/>
              </svg>
            )}
          </button>

          {/* Skip Backward */}
          <button
            onClick={handleButtonClick(onSkipBackward)}
            className="cursor-pointer text-white/80 hover:text-white transition-colors"
            aria-label="Skip backward 10 seconds"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5">
                <path stroke-linejoin="round" d="m12 5l-1.104-1.545c-.41-.576-.617-.864-.487-1.13c.13-.268.46-.283 1.12-.314Q11.763 2 12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12a9.99 9.99 0 0 1 4-8"/>
                <path d="M7.992 11.004C8.52 10.584 9 9.891 9.3 10.02s.204.552.204 1.212v4.776m6.498-3.408c0-1.38.066-1.752-.198-2.196s-.924-.406-1.584-.406s-1.14-.038-1.458.322c-.39.42-.222 1.2-.27 2.28c.108 1.44-.186 2.58.264 3.06c.324.396.9.336 1.584.348c.68-.008 1.092.024 1.428-.36c.372-.336.192-1.668.234-3.048Z"/>
              </g>
            </svg>
          </button>

          {/* Skip Forward */}
          <button
            onClick={handleButtonClick(onSkipForward)}
            className="cursor-pointer text-white/80 hover:text-white transition-colors"
            aria-label="Skip forward 10 seconds"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5">
                <path stroke-linejoin="round" d="m12 5l1.104-1.545c.41-.576.617-.864.487-1.13c-.13-.268-.46-.283-1.12-.314Q12.237 2 12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10a9.99 9.99 0 0 0-4-8"/>
                <path d="M7.992 11.004C8.52 10.584 9 9.891 9.3 10.02s.204.552.204 1.212v4.776m6.498-3.408c0-1.38.066-1.752-.198-2.196s-.924-.406-1.584-.406s-1.14-.038-1.458.322c-.39.42-.222 1.2-.27 2.28c.108 1.44-.186 2.58.264 3.06c.324.396.9.336 1.584.348c.68-.008 1.092.024 1.428-.36c.372-.336.192-1.668.234-3.048Z"/>
              </g>
            </svg>
          </button>

          {/* Volume Control */}
          <div className="relative flex items-center group">
            <button
              onClick={handleButtonClick(onToggleMute)}
              className="cursor-pointer text-white/80 hover:text-white transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" stroke-width="1.5" d="M5.035 10.971c.073-1.208.11-1.813.424-2.394a3.2 3.2 0 0 1 1.38-1.3C7.44 7 8.127 7 9.5 7c.512 0 .768 0 1.016-.042q.37-.063.712-.214c.23-.101.444-.242.871-.524l.22-.144C14.86 4.399 16.132 3.56 17.2 3.925c.205.07.403.17.58.295c.922.648.992 2.157 1.133 5.174A68 68 0 0 1 19 12c0 .532-.035 1.488-.087 2.605c-.14 3.018-.21 4.526-1.133 5.175a2.3 2.3 0 0 1-.58.295c-1.067.364-2.339-.474-4.882-2.151l-.219-.144c-.427-.282-.64-.423-.871-.525a3 3 0 0 0-.712-.213C10.268 17 10.012 17 9.5 17c-1.374 0-2.06 0-2.66-.277a3.2 3.2 0 0 1-1.381-1.3c-.314-.582-.35-1.186-.424-2.395A17 17 0 0 1 5 12c0-.323.013-.671.035-1.029Z"/>
                  <path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M22 2L2 22"/>
                </svg>
              ) : volume === 0 ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" stroke-width="1.5" d="M5.035 10.971c.073-1.208.11-1.813.424-2.394a3.2 3.2 0 0 1 1.38-1.3C7.44 7 8.127 7 9.5 7c.512 0 .768 0 1.016-.042q.37-.063.712-.214c.23-.101.444-.242.871-.524l.22-.144C14.86 4.399 16.132 3.56 17.2 3.925c.205.07.403.17.58.295c.922.648.992 2.157 1.133 5.174A68 68 0 0 1 19 12c0 .532-.035 1.488-.087 2.605c-.14 3.018-.21 4.526-1.133 5.175a2.3 2.3 0 0 1-.58.295c-1.067.364-2.339-.474-4.882-2.151l-.219-.144c-.427-.282-.64-.423-.871-.525a3 3 0 0 0-.712-.213C10.268 17 10.012 17 9.5 17c-1.374 0-2.06 0-2.66-.277a3.2 3.2 0 0 1-1.381-1.3c-.314-.582-.35-1.186-.424-2.395A17 17 0 0 1 5 12c0-.323.013-.671.035-1.029Z"/>
                  <path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M22 2L2 22"/>
                </svg>
              ) : volume < 0.5 ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M1.535 10.971c.073-1.208.11-1.813.424-2.394a3.2 3.2 0 0 1 1.38-1.3C3.94 7 4.627 7 6 7c.512 0 .768 0 1.016-.042a3 3 0 0 0 .712-.214c.23-.101.444-.242.871-.524l.22-.144C11.36 4.399 12.632 3.56 13.7 3.925c.205.07.403.17.58.295c.922.648.993 2.157 1.133 5.174A68 68 0 0 1 15.5 12c0 .532-.035 1.488-.087 2.605c-.14 3.018-.21 4.526-1.133 5.175a2.3 2.3 0 0 1-.58.295c-1.067.364-2.339-.474-4.882-2.151L8.6 17.78c-.427-.282-.64-.423-.871-.525a3 3 0 0 0-.712-.213C6.768 17 6.512 17 6 17c-1.374 0-2.06 0-2.66-.277a3.2 3.2 0 0 1-1.381-1.3c-.314-.582-.35-1.186-.424-2.395A17 17 0 0 1 1.5 12c0-.323.013-.671.035-1.029Z"/>
                    <path stroke-linecap="round" d="M18 9s.5.9.5 3s-.5 3-.5 3"/>
                  </g>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M1.535 10.971c.073-1.208.11-1.813.424-2.394a3.2 3.2 0 0 1 1.38-1.3C3.94 7 4.627 7 6 7c.512 0 .768 0 1.016-.042a3 3 0 0 0 .712-.214c.23-.101.444-.242.871-.524l.22-.144C11.36 4.399 12.632 3.56 13.7 3.925c.205.07.403.17.58.295c.922.648.993 2.157 1.133 5.174A68 68 0 0 1 15.5 12c0 .532-.035 1.488-.087 2.605c-.14 3.018-.21 4.526-1.133 5.175a2.3 2.3 0 0 1-.58.295c-1.067.364-2.339-.474-4.882-2.151L8.6 17.78c-.427-.282-.64-.423-.871-.525a3 3 0 0 0-.712-.213C6.768 17 6.512 17 6 17c-1.374 0-2.06 0-2.66-.277a3.2 3.2 0 0 1-1.381-1.3c-.314-.582-.35-1.186-.424-2.395A17 17 0 0 1 1.5 12c0-.323.013-.671.035-1.029Z"/>
                    <path stroke-linecap="round" d="M20 6s1.5 1.8 1.5 6s-1.5 6-1.5 6m-2-9s.5.9.5 3s-.5 3-.5 3"/>
                  </g>
                </svg>
              )}
            </button>
            <div className="relative w-24 h-1.5 bg-white/20 rounded-full ml-2 overflow-visible">
              <div 
                className="absolute top-0 left-0 h-full rounded-full"
                style={{ 
                  width: `${(isMuted ? 0 : volume) * 100}%`,
                  background: 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                }}
              ></div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="absolute inset-0 w-full h-6 -top-0.5 cursor-pointer bg-transparent z-10"
                style={{ WebkitAppearance: 'none', appearance: 'none' }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg pointer-events-none"
                style={{ 
                  left: `calc(${(isMuted ? 0 : volume) * 100}% - 6px)`
                }}
              ></div>
            </div>
            {/* Duration Timer */}
            <div className="flex items-center gap-1 ml-3 text-xs text-white tabular-nums select-none" style={{ fontFamily: 'var(--font-rubik), Rubik, sans-serif' }}>
              <span>{formatTime(currentTime)}</span>
              <span className="text-white/50">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-4">
          {/* Caption Button */}
          <button
            onClick={() => { setShowSettings(true); setActiveSection('captions'); }}
            className={`cursor-pointer transition-colors ${captionsEnabled ? 'text-blue-400' : 'text-white/80 hover:text-white'}`}
            aria-label="Captions"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
              <path fill="currentColor" d="M18.75 4A3.25 3.25 0 0 1 22 7.25v9.505a3.25 3.25 0 0 1-3.25 3.25H5.25A3.25 3.25 0 0 1 2 16.755V7.25a3.25 3.25 0 0 1 3.066-3.245L5.25 4zm0 1.5H5.25l-.144.006A1.75 1.75 0 0 0 3.5 7.25v9.505c0 .966.784 1.75 1.75 1.75h13.5a1.75 1.75 0 0 0 1.75-1.75V7.25a1.75 1.75 0 0 0-1.75-1.75M5.5 12c0-3.146 2.713-4.775 5.122-3.401A.75.75 0 0 1 9.878 9.9C8.481 9.104 7 9.994 7 12c0 2.005 1.484 2.896 2.88 2.103a.75.75 0 0 1 .74 1.304C8.216 16.775 5.5 15.143 5.5 12m7.5 0c0-3.146 2.713-4.775 5.122-3.401a.75.75 0 0 1-.744 1.302C15.981 9.104 14.5 9.994 14.5 12c0 2.005 1.484 2.896 2.88 2.103a.75.75 0 0 1 .74 1.304C15.716 16.775 13 15.143 13 12"/>
            </svg>
          </button>

          {/* Picture-in-Picture Button */}
          <button
            onClick={handleButtonClick(onTogglePiP)}
            className="cursor-pointer text-white/80 hover:text-white transition-colors"
            aria-label="Picture in Picture"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
              <path fill="currentColor" fill-rule="evenodd" d="M9.944 2.25h4.112c1.838 0 3.294 0 4.433.153c1.172.158 2.121.49 2.87 1.238c.748.749 1.08 1.698 1.238 2.87c.153 1.14.153 2.595.153 4.433V11a.75.75 0 0 1-1.5 0c0-1.907-.002-3.261-.14-4.29c-.135-1.005-.389-1.585-.812-2.008s-1.003-.677-2.009-.812c-1.027-.138-2.382-.14-4.289-.14h-4c-1.907 0-3.261.002-4.29.14c-1.005.135-1.585.389-2.008.812S3.025 5.705 2.89 6.71c-.138 1.029-.14 2.383-.14 4.29v2c0 1.907.002 3.262.14 4.29c.135 1.005.389 1.585.812 2.008s1.003.677 2.009.812c1.028.138 2.382.14 4.289.14h1a.75.75 0 0 1 0 1.5H9.944c-1.838 0-3.294 0-4.433-.153c-1.172-.158-2.121-.49-2.87-1.238c-.748-.749-1.08-1.698-1.238-2.87c-.153-1.14-.153-2.595-.153-4.433v-2.112c0-1.838 0-3.294.153-4.433c.158-1.172.49-2.121 1.238-2.87c.749-.748 1.698-1.08 2.87-1.238c1.14-.153 2.595-.153 4.433-.153m7.004 10h1.104c.899 0 1.648 0 2.242.08c.628.084 1.195.27 1.65.726c.456.455.642 1.022.726 1.65c.08.594.08 1.343.08 2.242v.104c0 .899 0 1.648-.08 2.242c-.084.628-.27 1.195-.726 1.65c-.455.456-1.022.642-1.65.726c-.594.08-1.343.08-2.242.08h-1.104c-.899 0-1.648 0-2.242-.08c-.628-.084-1.195-.27-1.65-.726c-.456-.455-.642-1.022-.726-1.65c-.08-.594-.08-1.343-.08-2.242v-.104c0-.899 0-1.648.08-2.242c.084-.628.27-1.195.726-1.65c.455-.456 1.022-.642 1.65-.726c.594-.08 1.343-.08 2.242-.08m-2.043 1.566c-.461.063-.659.17-.789.3s-.237.328-.3.79c-.064.482-.066 1.13-.066 2.094s.002 1.612.066 2.095c.063.461.17.659.3.789s.328.237.79.3c.482.064 1.13.066 2.094.066h1c.964 0 1.612-.002 2.095-.067c.461-.062.659-.169.789-.3s.237-.327.3-.788c.064-.483.066-1.131.066-2.095s-.002-1.612-.067-2.095c-.062-.461-.169-.659-.3-.789s-.327-.237-.788-.3c-.483-.064-1.131-.066-2.095-.066h-1c-.964 0-1.612.002-2.095.066" clip-rule="evenodd"/>
            </svg>
          </button>

          {/* Settings Button */}
          <div className="relative mt-1">
            <button
              onClick={handleButtonClick(() => setShowSettings(!showSettings))}
              className="cursor-pointer text-white/80 hover:text-white transition-colors"
              aria-label="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M13.765 2.152C13.398 2 12.932 2 12 2s-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083c-.092.223-.129.484-.143.863a1.62 1.62 0 0 1-.79 1.353a1.62 1.62 0 0 1-1.567.008c-.336-.178-.579-.276-.82-.308a2 2 0 0 0-1.478.396C4.04 5.79 3.806 6.193 3.34 7s-.7 1.21-.751 1.605a2 2 0 0 0 .396 1.479c.148.192.355.353.676.555c.473.297.777.803.777 1.361s-.304 1.064-.777 1.36c-.321.203-.529.364-.676.556a2 2 0 0 0-.396 1.479c.052.394.285.798.75 1.605c.467.807.7 1.21 1.015 1.453a2 2 0 0 0 1.479.396c.24-.032.483-.13.819-.308a1.62 1.62 0 0 1 1.567.008c.483.28.77.795.79 1.353c.014.38.05.64.143.863a2 2 0 0 0 1.083 1.083C10.602 22 11.068 22 12 22s1.398 0 1.765-.152a2 2 0 0 0 1.083-1.083c.092-.223.129-.483.143-.863c.02-.558.307-1.074.79-1.353a1.62 1.62 0 0 1 1.567-.008c.336.178.579.276.819.308a2 2 0 0 0 1.479-.396c.315-.242.548-.646 1.014-1.453s.7-1.21.751-1.605a2 2 0 0 0-.396-1.479c-.148-.192-.355-.353-.676-.555A1.62 1.62 0 0 1 19.562 12c0-.558.304-1.064.777-1.36c.321-.203.529-.364.676-.556a2 2 0 0 0 .396-1.479c-.052-.394-.285-.798-.75-1.605c-.467-.807-.7-1.21-1.015-1.453a2 2 0 0 0-1.479-.396c-.24.032-.483.13-.82.308a1.62 1.62 0 0 1-1.566-.008a1.62 1.62 0 0 1-.79-1.353c-.014-.38-.05-.64-.143-.863a2 2 0 0 0-1.083-1.083Z"/>
                </g>
              </svg>
            </button>

            {/* Settings Menu */}
            {showSettings && (
              <div className="absolute bottom-full right-0 mb-3 bg-black/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50 w-64 cursor-default">
                {!activeSection ? (
                  <div className="p-2">
                    <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-white/40 font-semibold select-none">Settings</div>
                    <button
                      onClick={() => setActiveSection('quality')}
                      className="cursor-pointer w-full flex items-center justify-between px-3 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
                    >
                      <span>Quality</span>
                      <span className="text-white/40 text-xs">{selectedQuality}</span>
                    </button>
                    <button
                      onClick={() => setActiveSection('speed')}
                      className="cursor-pointer w-full flex items-center justify-between px-3 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
                    >
                      <span>Playback Speed</span>
                      <span className="text-white/40 text-xs">{selectedSpeed}</span>
                    </button>
                    <button
                      onClick={() => setActiveSection('captions')}
                      className="cursor-pointer w-full flex items-center justify-between px-3 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
                    >
                      <span>Captions</span>
                      <span className="text-white/40 text-xs">{captionsEnabled ? 'On' : 'Off'}</span>
                    </button>
                    <button
                      onClick={() => setActiveSection('captions_language')}
                      className="cursor-pointer w-full flex items-center justify-between px-3 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
                    >
                      <span>Caption Language</span>
                      <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setActiveSection('captions_size')}
                      className="cursor-pointer w-full flex items-center justify-between px-3 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
                    >
                      <span>Caption Size</span>
                      <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="p-2">
                    <button
                      onClick={() => setActiveSection(null)}
                      className="cursor-pointer flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white transition-colors mb-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back
                    </button>
                    <div className="border-t border-white/10 pt-2">
                      {activeSection === 'quality' && (
                        <>
                          <div className="px-3 py-2 text-xs text-white/40 font-semibold select-none">Quality</div>
                          {qualities.map((q) => (
                            <button
                              key={q}
                              onClick={() => { setSelectedQuality(q); setShowSettings(false); }}
                              className={`cursor-pointer w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${selectedQuality === q ? 'bg-blue-500/30 text-blue-400' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                            >
                              {q}
                            </button>
                          ))}
                        </>
                      )}
                      {activeSection === 'speed' && (
                        <>
                          <div className="px-3 py-2 text-xs text-white/40 font-semibold select-none">Playback Speed</div>
                          {speeds.map((s) => (
                            <button
                              key={s}
                              onClick={() => { setSelectedSpeed(s); setShowSettings(false); }}
                              className={`cursor-pointer w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${selectedSpeed === s ? 'bg-blue-500/30 text-blue-400' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                            >
                              {s}
                            </button>
                          ))}
                        </>
                      )}
                      {activeSection === 'captions' && (
                        <>
                          <div className="px-3 py-2 text-xs text-white/40 font-semibold select-none">Captions</div>
                          <button
                            onClick={() => { setCaptionsEnabled(!captionsEnabled); setShowSettings(false); }}
                            className={`cursor-pointer w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors ${captionsEnabled ? 'bg-blue-500/30 text-blue-400' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                          >
                            {captionsEnabled ? 'On' : 'Off'}
                          </button>
                        </>
                      )}
                      {activeSection === 'captions_language' && (
                        <>
                          <div className="px-3 py-2 text-xs text-white/40 font-semibold select-none">Caption Language</div>
                          {captionLanguages.map((lang) => (
                            <button
                              key={lang}
                              onClick={() => setShowSettings(false)}
                              className={`cursor-pointer w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${lang === 'English' ? 'bg-blue-500/30 text-blue-400' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                            >
                              {lang}
                            </button>
                          ))}
                        </>
                      )}
                      {activeSection === 'captions_size' && (
                        <>
                          <div className="px-3 py-2 text-xs text-white/40 font-semibold select-none">Caption Size</div>
                          {captionSizes.map((size) => (
                            <button
                              key={size}
                              onClick={() => setShowSettings(false)}
                              className={`cursor-pointer w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${size === 'Medium' ? 'bg-blue-500/30 text-blue-400' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                            >
                              {size}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={handleButtonClick(onToggleFullscreen)}
            className="cursor-pointer text-white/80 hover:text-white transition-colors"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                <path fill="currentColor" fill-rule="evenodd" d="M14 1.25a.75.75 0 0 1 .75.75c0 1.907.002 3.261.14 4.29c.135 1.005.389 1.585.812 2.008s1.003.677 2.009.812c1.027.138 2.382.14 4.289.14a.75.75 0 0 1 0 1.5h-.056c-1.838 0-3.294 0-4.433-.153c-1.172-.158-2.121-.49-2.87-1.238c-.748-.749-1.08-1.698-1.238-2.87c-.153-1.14-.153-2.595-.153-4.433V2a.75.75 0 0 1 .75-.75m-4 0a.75.75 0 0 1 .75.75v.056c0 1.838 0 3.294-.153 4.433c-.158 1.172-.49 2.121-1.238 2.87c-.749.748-1.698 1.08-2.87 1.238c-1.14.153-2.595.153-4.433.153H2a.75.75 0 0 1 0-1.5c1.907 0 3.261-.002 4.29-.14c1.005-.135 1.585-.389 2.008-.812s.677-1.003.812-2.009c.138-1.028.14-2.382.14-4.289a.75.75 0 0 1 .75-.75M1.25 14a.75.75 0 0 1 .75-.75h.056c1.838 0 3.294 0 4.433.153c1.172.158 2.121.49 2.87 1.238c.748.749 1.08 1.698 1.238 2.87c.153 1.14.153 2.595.153 4.433V22a.75.75 0 0 1-1.5 0c0-1.907-.002-3.262-.14-4.29c-.135-1.005-.389-1.585-.812-2.008s-1.003-.677-2.009-.812c-1.028-.138-2.382-.14-4.289-.14a.75.75 0 0 1-.75-.75m20.694-.75H22a.75.75 0 0 1 0 1.5c-1.907 0-3.262.002-4.29.14c-1.005.135-1.585.389-2.008.812s-.677 1.003-.812 2.009c-.138 1.027-.14 2.382-.14 4.289a.75.75 0 0 1-1.5 0v-.056c0-1.838 0-3.294.153-4.433c.158-1.172.49-2.121 1.238-2.87c.749-.748 1.698-1.08 2.87-1.238c1.14-.153 2.595-.153 4.433-.153" clip-rule="evenodd"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                <path fill="currentColor" fill-rule="evenodd" d="M9.944 1.25H10a.75.75 0 0 1 0 1.5c-1.907 0-3.261.002-4.29.14c-1.005.135-1.585.389-2.008.812S3.025 4.705 2.89 5.71c-.138 1.029-.14 2.383-.14 4.29a.75.75 0 0 1-1.5 0v-.056c0-1.838 0-3.294.153-4.433c.158-1.172.49-2.121 1.238-2.87c.749-.748 1.698-1.08 2.87-1.238c1.14-.153 2.595-.153 4.433-.153m8.345 1.64c-1.027-.138-2.382-.14-4.289-.14a.75.75 0 0 1 0-1.5h.056c1.838 0 3.294 0 4.433.153c1.172.158 2.121.49 2.87 1.238c.748.749 1.08 1.698 1.238 2.87c.153 1.14.153 2.595.153 4.433V10a.75.75 0 0 1-1.5 0c0-1.907-.002-3.261-.14-4.29c-.135-1.005-.389-1.585-.812-2.008s-1.003-.677-2.009-.812M2 13.25a.75.75 0 0 1 .75.75c0 1.907.002 3.262.14 4.29c.135 1.005.389 1.585.812 2.008s1.003.677 2.009.812c1.028.138 2.382.14 4.289.14a.75.75 0 0 1 0 1.5h-.056c-1.838 0-3.294 0-4.433-.153c-1.172-.158-2.121-.49-2.87-1.238c-.748-.749-1.08-1.698-1.238-2.87c-.153-1.14-.153-2.595-.153-4.433V14a.75.75 0 0 1 .75-.75m20 0a.75.75 0 0 1 .75.75v.056c0 1.838 0 3.294-.153 4.433c-.158 1.172-.49 2.121-1.238 2.87c-.749.748-1.698 1.08-2.87 1.238c-1.14.153-2.595.153-4.433.153H14a.75.75 0 0 1 0-1.5c1.907 0 3.262-.002 4.29-.14c1.005-.135 1.585-.389 2.008-.812s.677-1.003.812-2.009c.138-1.027.14-2.382.14-4.289a.75.75 0 0 1 .75-.75" clip-rule="evenodd"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

VideoControls.displayName = 'VideoControls';

export default VideoControls;

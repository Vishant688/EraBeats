// src/component/PlayerBar.jsx
// Spotify-style bottom player bar

const thumbStyles =
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:opacity-0 group-hover:[&::-webkit-slider-thumb]:opacity-100 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white";

function PlayerBar({
  music,
  image,
  isPlaying,
  isLiked,
  currentTime,
  duration,
  volume,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onToggleLike,
  onVolumeChange,
  isShuffle,
  repeatMode,
  onToggleShuffle,
  onToggleRepeat,
  formatTime,
}) {
  const progress = duration ? (currentTime / duration) * 100 : 0;
  const volumePercent = volume * 100;

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black px-3 py-2 sm:px-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_minmax(320px,600px)_1fr] items-center gap-2 md:gap-3">
        {/* LEFT: cover + title + artist + like */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-md bg-[#282828] flex items-center justify-center">
            {image ? (
              <img
                src={image}
                alt={music.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl">🎵</span>
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white sm:text-base">
              {music.title || "Unknown Song"}
            </p>
            <p className="truncate text-xs text-gray-400 sm:text-sm">
              {music.artistName || music.artist?.username || "Unknown Artist"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onToggleLike(music._id)}
            aria-label="Toggle like"
            className={`ml-2 shrink-0 transition hover:scale-110 ${
              isLiked ? "text-green-500" : "text-gray-400 hover:text-white"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.6 5 5.9 5c2 0 3.4 1.1 4.1 2.3C10.7 6.1 12.1 5 14.1 5c3.3 0 5 3.4 3.5 6.8C19.5 16.4 12 21 12 21z" />
            </svg>
          </button>
        </div>

        {/* CENTER: controls + progress */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-4 sm:gap-5">
            <button
              type="button"
              onClick={onToggleShuffle}
              aria-label="Shuffle"
              title={isShuffle ? "Shuffle: On" : "Shuffle: Off"}
              className={`relative transition hover:scale-110 ${
                isShuffle ? "text-green-500" : "text-gray-400 hover:text-white"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 3h5v5" />
                <path d="M4 20 21 3" />
                <path d="M21 16v5h-5" />
                <path d="m15 15 6 6" />
                <path d="m4 4 5 5" />
              </svg>
              {isShuffle && (
                <span className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-green-500" />
              )}
            </button>

            <button
              type="button"
              onClick={onPrevious}
              aria-label="Previous song"
              className="text-gray-400 transition hover:scale-110 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M6 5h2v14H6zM19 6v12L9 12z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-black transition hover:scale-105 hover:bg-green-400 active:scale-95"
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 translate-x-0.5 fill-current"
                >
                  <path d="M7 4.5v15L20 12z" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={onNext}
              aria-label="Next song"
              className="text-gray-400 transition hover:scale-110 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M16 5h2v14h-2zM5 6v12l10-6z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={onToggleRepeat}
              aria-label="Repeat"
              title={
                repeatMode === "one"
                  ? "Repeat: One song"
                  : repeatMode === "all"
                    ? "Repeat: All songs"
                    : "Repeat: Off"
              }
              className={`relative transition hover:scale-110 ${
                repeatMode !== "off"
                  ? "text-green-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m17 2 4 4-4 4" />
                <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                <path d="m7 22-4-4 4-4" />
                <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                {repeatMode === "one" && <path d="M11 10h1v4" />}
              </svg>
              {repeatMode !== "off" && (
                <span className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-green-500" />
              )}
            </button>
          </div>

          <div className="group flex w-full items-center gap-2 text-[11px] text-gray-400">
            <span className="w-9 text-right tabular-nums">
              {formatTime(currentTime)}
            </span>

            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={Math.min(currentTime, duration || 0)}
              onChange={onSeek}
              aria-label="Song progress"
              style={{
                background: `linear-gradient(to right, #1db954 ${progress}%, #4d4d4d ${progress}%)`,
              }}
              className={`h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full ${thumbStyles}`}
            />

            <span className="w-9 tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>

        {/* RIGHT: status + volume */}
        <div className="hidden items-center justify-end gap-4 md:flex">
          <span
            className={`flex items-center gap-1 text-sm font-semibold ${
              isPlaying ? "text-green-400" : "text-gray-400"
            }`}
          >
            ♫ {isPlaying ? "Playing" : "Paused"}
          </span>

          <div className="flex items-center gap-2 text-gray-400">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" />
            </svg>
            <div className="group flex items-center">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={onVolumeChange}
                aria-label="Volume"
                style={{
                  background: `linear-gradient(to right, #1db954 ${volumePercent}%, #4d4d4d ${volumePercent}%)`,
                }}
                className={`h-1 w-24 cursor-pointer appearance-none rounded-full ${thumbStyles}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerBar;

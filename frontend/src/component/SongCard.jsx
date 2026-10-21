
import jaiJaiRamImage from "../assets/jai-jai-ram.jpg";

function SongCard({
  music,
  isPlaying,
  onPlay,
  isLiked,
  onToggleLike,
}) {
  // Prefer the cover image uploaded by the admin.
  // Keep the existing local image as a fallback.
  const songImage =
    music?.coverImage ||
    (music?.title?.trim() === "Jai Jai Ram"
      ? jaiJaiRamImage
      : null);

  return (
    <div className="group bg-[#181818] hover:bg-[#282828] p-4 rounded-xl transition duration-300">
      <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-red-500 to-black shadow-lg">
        {songImage ? (
          <img
            src={songImage}
            alt={music?.title || "Song cover"}
            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">🎵</span>
          </div>
        )}

        <button
          type="button"
          onClick={onPlay}
          aria-label={isPlaying ? "Pause song" : "Play song"}
          className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-[#1ed75f] text-black flex items-center justify-center text-xl shadow-xl opacity-100 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition duration-300 hover:scale-110"
        >
          {isPlaying ? "Ⅱ" : "▶"}
        </button>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-white font-bold truncate">
            {music?.title?.trim() || "Unknown Song"}
          </h3>

          <p className="text-gray-400 text-sm mt-2 truncate">
            {music?.artistName ||
              music?.artist?.username ||
              "Unknown Artist"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onToggleLike(music._id)}
          aria-label={isLiked ? "Unlike song" : "Like song"}
          title={
            isLiked
              ? "Remove from Liked Songs"
              : "Add to Liked Songs"
          }
          className={`text-2xl transition hover:scale-110 ${
            isLiked
              ? "text-red-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {isLiked ? "♥" : "♡"}
        </button>
      </div>
    </div>
  );
}

export default SongCard;

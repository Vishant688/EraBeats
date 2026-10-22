import { useEffect, useRef, useState } from "react";
import axios from "axios";

import Sidebar from "./component/Sidebar";
import Navbar from "./component/Navbar";
import SongCard from "./component/SongCard";
import PlayerBar from "./component/PlayerBar";
import jaiJaiRamImage from "./assets/jai-jai-ram.jpg";
import logo from "./assets/EraBeats.png";

// Backend URL: set VITE_API_URL on Vercel; falls back to localhost for development
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API = `${API_BASE}/api/music`;
const AUTH_API = `${API_BASE}/api/auth`;

function App() {
  const [musics, setMusics] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  // Admin upload form
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadArtist, setUploadArtist] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  const audioFileRef = useRef(null);
  const coverFileRef = useRef(null);

  // Music player
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  // "off" | "all" | "one"
  const [repeatMode, setRepeatMode] = useState("all");

  const audioRef = useRef(null);

  // Fetch songs
  const loadSongs = async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      const response = await axios.get(API, {
        withCredentials: true,
      });

      setMusics(response.data.musics || []);
      setIsLoggedIn(true);
      setAuthError("");
    } catch (error) {
      console.error("Songs loading error:", error);

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        setMusics([]);
        setIsLoggedIn(false);
        setCurrentUser(null);
      } else {
        setAuthError(
          "Song does'nt loaded. Please check Backend Server."
        );
      }
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Restore logged-in user and role
  const loadCurrentUser = async () => {
    try {
      const response = await axios.get(`${AUTH_API}/me`, {
        withCredentials: true,
      });

      setCurrentUser(response.data.user);
      setIsLoggedIn(true);
      return true;
    } catch {
      setCurrentUser(null);
      setIsLoggedIn(false);
      return false;
    }
  };

  // Fetch liked and recently played songs
  const loadUserMusic = async () => {
    try {
      const [likedResponse, recentResponse] = await Promise.all([
        axios.get(`${API}/liked`, {
          withCredentials: true,
        }),
        axios.get(`${API}/recently-played`, {
          withCredentials: true,
        }),
      ]);

      setLikedSongs(likedResponse.data.likedSongs || []);
      setRecentlyPlayed(
        recentResponse.data.recentlyPlayed || []
      );
    } catch (error) {
      console.error("User music loading error:", error);
    }
  };

  // Initialize app on page load
  useEffect(() => {
    let cancelled = false;

    async function initializeApp() {
      const loggedIn = await loadCurrentUser();

      if (cancelled) return;

      if (loggedIn) {
        await loadSongs();
      } else {
        setLoading(false);
      }
    }

    initializeApp();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load personal music when logged in
  useEffect(() => {
    if (isLoggedIn) {
      loadUserMusic();
    } else {
      setLikedSongs([]);
      setRecentlyPlayed([]);
    }
  }, [isLoggedIn]);

  // Refresh songs every 20 seconds
  useEffect(() => {
    if (!isLoggedIn) return;

    const intervalId = setInterval(() => {
      loadSongs(false);
    }, 20000);

    return () => clearInterval(intervalId);
  }, [isLoggedIn]);

  const currentMusic =
    currentIndex >= 0 ? musics[currentIndex] : null;

  const likedIds = new Set(
    likedSongs.map((song) => song._id)
  );

  // Login and signup
  const handleAuthSubmit = async (event) => {
    event.preventDefault();

    setAuthError("");
    setAuthMessage("");
    setAuthLoading(true);

    try {
      const endpoint =
        authMode === "signup"
          ? `${AUTH_API}/register`
          : `${AUTH_API}/login`;

      const payload =
        authMode === "signup"
          ? {
              username: username.trim(),
              email: email.trim(),
              password,
            }
          : {
              email: email.trim(),
              password,
            };

      const response = await axios.post(endpoint, payload, {
        withCredentials: true,
      });

      setCurrentUser(response.data.user || null);
      setIsLoggedIn(true);

      setAuthMessage(
        authMode === "signup"
          ? "Account created successfully!"
          : "Login successful!"
      );

      setPassword("");
      setUsername("");

      await loadSongs();
    } catch (error) {
      console.error("Authentication error:", error);

      setAuthError(
        error.response?.data?.message ||
          "Login/signup failed. Please check backend."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await axios.post(
        `${AUTH_API}/logout`,
        {},
        { withCredentials: true }
      );

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
      }

      setIsLoggedIn(false);
      setCurrentUser(null);
      setMusics([]);
      setLikedSongs([]);
      setRecentlyPlayed([]);
      setCurrentIndex(-1);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setSearchQuery("");
      setView("home");

      setShowUploadForm(false);
      setUploadTitle("");
      setUploadArtist("");
      setAudioFile(null);
      setCoverFile(null);
      setUploadError("");
      setUploadMessage("");
      setAuthError("");
      setAuthMessage("");
    } catch (error) {
      console.error("Logout error:", error);

      setAuthError(
        error.response?.data?.message || "Logout failed."
      );
    }
  };

  // Admin uploads a song and its cover image
  const handleUploadSong = async (event) => {
    event.preventDefault();

    setUploadError("");
    setUploadMessage("");

    if (currentUser?.role !== "admin") {
      setUploadError("Only admin can upload songs.");
      return;
    }

    if (!uploadTitle.trim() || !audioFile || !coverFile) {
      setUploadError(
        "Song title, audio file and choose cover images."
      );
      return;
    }

    if (!audioFile.type.startsWith("audio/")) {
      setUploadError("Select Valid audio file..");
      return;
    }

    if (!coverFile.type.startsWith("image/")) {
      setUploadError("Select Valid cover images.");
      return;
    }

    const formData = new FormData();

    formData.append("title", uploadTitle.trim());
    formData.append("artistName", uploadArtist.trim());
    formData.append("music", audioFile);
    formData.append("coverImage", coverFile);

    setUploading(true);

    try {
      const response = await axios.post(
        `${API}/upload`,
        formData,
        { withCredentials: true }
      );

      setUploadMessage(
        response.data?.message || "Song uploaded successfully!"
      );

      setUploadTitle("");
      setUploadArtist("");
      setAudioFile(null);
      setCoverFile(null);

      if (audioFileRef.current) {
        audioFileRef.current.value = "";
      }

      if (coverFileRef.current) {
        coverFileRef.current.value = "";
      }

      await loadSongs(false);

      setView("home");
      setSearchQuery("");
    } catch (error) {
      console.error("Song upload error:", error);

      if (error.response?.status === 401) {
        setUploadError(
          "Session will be expire . again login."
        );
      } else if (error.response?.status === 403) {
        setUploadError(
          "Only Admin Song Uploaded."
        );
      } else {
        setUploadError(
          error.response?.data?.message ||
            "Upload failed.  Check Backend and ImageKit configuration c."
        );
      }
    } finally {
      setUploading(false);
    }
  };

  // Like or unlike a song
  const toggleLike = async (musicId) => {
    try {
      if (likedIds.has(musicId)) {
        await axios.delete(`${API}/liked/${musicId}`, {
          withCredentials: true,
        });
      } else {
        await axios.post(
          `${API}/liked/${musicId}`,
          {},
          { withCredentials: true }
        );
      }

      const response = await axios.get(`${API}/liked`, {
        withCredentials: true,
      });

      setLikedSongs(response.data.likedSongs || []);
    } catch (error) {
      console.error("Like error:", error);
      alert("Does not Update like. Please Check Backend.");
    }
  };

  // Save recently played song
  const saveRecentlyPlayed = async (musicId) => {
    try {
      await axios.post(
        `${API}/recently-played/${musicId}`,
        {},
        { withCredentials: true }
      );

      const response = await axios.get(
        `${API}/recently-played`,
        { withCredentials: true }
      );

      setRecentlyPlayed(
        response.data.recentlyPlayed || []
      );
    } catch (error) {
      console.error("Recently played error:", error);
    }
  };

  // Play a song
  const playSong = (index) => {
    if (index < 0 || index >= musics.length) return;

    if (index === currentIndex) {
      const audio = audioRef.current;

      if (!audio) return;

      if (audio.paused) {
        audio.play().catch(console.error);
      } else {
        audio.pause();
      }

      return;
    }

    setCurrentTime(0);
    setDuration(0);
    setCurrentIndex(index);
    setIsPlaying(true);

    saveRecentlyPlayed(musics[index]._id);
  };

  // Load and play selected audio
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentMusic?.uri || !isLoggedIn) return;

    audio.pause();
    audio.currentTime = 0;

    if (isPlaying) {
      audio.play().catch((error) => {
        console.error("Playback error:", error);
        setIsPlaying(false);
      });
    }
  }, [currentIndex, currentMusic?.uri, isLoggedIn]);

  const togglePlay = () => {
    if (!currentMusic) {
      if (musics.length > 0) playSong(0);
      return;
    }

    const audio = audioRef.current;

    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  };

  // Restart the current song from the beginning
  const restartCurrent = () => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.currentTime = 0;
    audio.play().catch(console.error);
  };

  // Next index: random when shuffle is on, otherwise in order (wraps around)
  const getNextIndex = () => {
    if (isShuffle && musics.length > 1) {
      let random = currentIndex;

      while (random === currentIndex) {
        random = Math.floor(Math.random() * musics.length);
      }

      return random;
    }

    return currentIndex < 0 || currentIndex >= musics.length - 1
      ? 0
      : currentIndex + 1;
  };

  const playNext = () => {
    if (musics.length === 0) return;

    const nextIndex = getNextIndex();

    if (nextIndex === currentIndex) {
      restartCurrent();
      return;
    }

    playSong(nextIndex);
  };

  const playPrevious = () => {
    if (musics.length === 0) return;

    // Like Spotify: after 3 seconds, Previous restarts the song
    if (audioRef.current && audioRef.current.currentTime > 3) {
      restartCurrent();
      return;
    }

    const previousIndex =
      currentIndex <= 0
        ? musics.length - 1
        : currentIndex - 1;

    if (previousIndex === currentIndex) {
      restartCurrent();
      return;
    }

    playSong(previousIndex);
  };

  // When a song finishes
  const handleEnded = () => {
    if (repeatMode === "one") {
      restartCurrent();
      return;
    }

    const isLast = currentIndex >= musics.length - 1;

    if (repeatMode === "off" && !isShuffle && isLast) {
      setIsPlaying(false);
      return;
    }

    playNext();
  };

  const toggleShuffle = () => setIsShuffle((previous) => !previous);

  const toggleRepeat = () =>
    setRepeatMode((previous) =>
      previous === "off" ? "all" : previous === "all" ? "one" : "off"
    );

  const formatTime = (time) => {
    if (!Number.isFinite(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  const handleSeek = (event) => {
    const audio = audioRef.current;

    if (!audio || !Number.isFinite(audio.duration)) return;

    audio.currentTime = Number(event.target.value);
    setCurrentTime(audio.currentTime);
  };

  const handleVolumeChange = (event) => {
    const value = Number(event.target.value);

    setVolume(value);

    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  };

  // Search by song title or artist name
  const filteredMusics = musics.filter((music) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return true;

    const title = (music.title || "").toLowerCase();

    const artist = (
      music.artistName ||
      music.artist?.username ||
      ""
    ).toLowerCase();

    return title.includes(query) || artist.includes(query);
  });

  // Select songs for the current view
  const displayedSongs =
    view === "liked"
      ? musics.filter((music) => likedIds.has(music._id))
      : view === "recent"
        ? recentlyPlayed
            .map((song) =>
              musics.find((music) => music._id === song._id)
            )
            .filter(Boolean)
        : filteredMusics;

  const sectionTitle =
    view === "liked"
      ? "Liked Songs"
      : view === "recent"
        ? "Recently Played"
        : searchQuery.trim()
          ? "Search Results"
          : "Popular Songs";

  const currentSongImage =
    currentMusic?.coverImage ||
    (currentMusic?.title?.trim() === "Jai Jai Ram"
      ? jaiJaiRamImage
      : null);

  // Sidebar navigation
  const handleNavigate = (page) => {
    if (page === "search") {
      setView("home");

      setTimeout(() => {
        document.getElementById("music-search")?.focus();
      }, 0);
    } else if (page === "library") {
      setView("liked");
    } else {
      setView("home");
    }
  };

  // LOGIN UI, ADMIN DASHBOARD, SONGS AND MUSIC PLAYER
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar only after login */}
      {isLoggedIn && (
        <Sidebar
          activePage={
            view === "liked" || view === "recent"
              ? "library"
              : view
          }
          onNavigate={handleNavigate}
          mobileOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
      )}

      <main
        className={`min-h-screen min-w-0 p-4 sm:p-6 ${
          isLoggedIn ? "md:ml-60 pb-52 md:pb-32" : "pb-8"
        }`}
      >
        <Navbar
          isLoggedIn={isLoggedIn}
          username={currentUser?.username}
          onMenuClick={() => setMenuOpen(true)}
          onLogout={handleLogout}
        />

        {!isLoggedIn ? (
          <section className="min-h-[75vh] flex items-center justify-center px-2 py-6">
            <div className="w-full max-w-[400px] bg-[#121212] border border-white/10 rounded-xl p-6 sm:p-7">
              <div className="text-center mb-6">
                <img
                  src={logo}
                  alt="EraBeats Playlist"
                  className="mx-auto mb-2 h-28 w-auto object-contain"
                />

                <h1 className="sr-only">EraBeats Playlist</h1>

                <p className="text-gray-400 text-sm mt-2">
                  {authMode === "login"
                    ? "Log in to start listening"
                    : "Sign up and enjoy your music"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-1 bg-[#242424] rounded-full p-1 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                    setAuthMessage("");
                  }}
                  className={`py-2.5 rounded-full text-sm font-bold transition ${
                    authMode === "login"
                      ? "bg-green-500 text-black"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Log In
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthError("");
                    setAuthMessage("");
                  }}
                  className={`py-2.5 rounded-full text-sm font-bold transition ${
                    authMode === "signup"
                      ? "bg-green-500 text-black"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <form
                onSubmit={handleAuthSubmit}
                className="space-y-4"
              >
                {authMode === "signup" && (
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-semibold mb-2"
                    >
                      Username
                    </label>

                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(event) =>
                        setUsername(event.target.value)
                      }
                      placeholder="Choose a username"
                      autoComplete="username"
                      required
                      className="w-full rounded-md bg-[#242424] border border-[#444] px-3 py-3 text-sm outline-none focus:border-green-500"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold mb-2"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                    className="w-full rounded-md bg-[#242424] border border-[#444] px-3 py-3 text-sm outline-none focus:border-green-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold mb-2"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete={
                      authMode === "login"
                        ? "current-password"
                        : "new-password"
                    }
                    required
                    className="w-full rounded-md bg-[#242424] border border-[#444] px-3 py-3 text-sm outline-none focus:border-green-500"
                  />
                </div>

                {authError && (
                  <p
                    className="text-red-400 text-sm"
                    role="alert"
                  >
                    {authError}
                  </p>
                )}

                {authMessage && (
                  <p
                    className="text-green-400 text-sm"
                    role="status"
                  >
                    {authMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full rounded-full bg-green-500 text-black font-bold py-3 hover:bg-green-400 disabled:opacity-50 transition"
                >
                  {authLoading
                    ? "Please wait..."
                    : authMode === "login"
                      ? "Log In"
                      : "Create Account"}
                </button>
              </form>

              <p className="text-center text-xs text-gray-500 mt-5">
                Your music, your mood ♫
              </p>
            </div>
          </section>
        ) : (
          <section className="mt-6 sm:mt-8">
            {/* Admin Dashboard */}
            {currentUser?.role === "admin" && (
              <div className="mb-8 rounded-xl border border-white/10 bg-[#181818] p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">
                      Admin Dashboard
                    </h2>

                    <p className="text-sm text-gray-400 mt-1">
                      Manage your EraBeats Music library
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadForm((previous) => !previous);
                      setUploadError("");
                      setUploadMessage("");
                    }}
                    className="rounded-full bg-green-500 px-5 py-2 font-bold text-black hover:bg-green-400"
                  >
                    {showUploadForm
                      ? "Close Form"
                      : "+ Upload Song"}
                  </button>
                </div>

                {showUploadForm && (
                  <form
                    onSubmit={handleUploadSong}
                    className="mt-6 space-y-4"
                  >
                    <div>
                      <label
                        htmlFor="upload-title"
                        className="mb-2 block text-sm font-semibold"
                      >
                        Song Title *
                      </label>

                      <input
                        id="upload-title"
                        type="text"
                        value={uploadTitle}
                        onChange={(event) =>
                          setUploadTitle(event.target.value)
                        }
                        placeholder="Enter song title"
                        required
                        className="w-full rounded-lg border border-white/10 bg-[#242424] p-3 outline-none focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="upload-artist"
                        className="mb-2 block text-sm font-semibold"
                      >
                        Singer / Artist Name
                      </label>

                      <input
                        id="upload-artist"
                        type="text"
                        value={uploadArtist}
                        onChange={(event) =>
                          setUploadArtist(event.target.value)
                        }
                        placeholder="Enter singer name"
                        className="w-full rounded-lg border border-white/10 bg-[#242424] p-3 outline-none focus:border-green-500"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="upload-audio"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Audio File *
                        </label>

                        <input
                          ref={audioFileRef}
                          id="upload-audio"
                          type="file"
                          accept="audio/*"
                          required
                          onChange={(event) =>
                            setAudioFile(
                              event.target.files?.[0] || null
                            )
                          }
                          className="block w-full text-sm text-gray-300 file:mr-3 file:rounded-full file:border-0 file:bg-green-500 file:px-4 file:py-2 file:font-semibold file:text-black"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="upload-cover"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Cover Image *
                        </label>

                        <input
                          ref={coverFileRef}
                          id="upload-cover"
                          type="file"
                          accept="image/*"
                          required
                          onChange={(event) =>
                            setCoverFile(
                              event.target.files?.[0] || null
                            )
                          }
                          className="block w-full text-sm text-gray-300 file:mr-3 file:rounded-full file:border-0 file:bg-green-500 file:px-4 file:py-2 file:font-semibold file:text-black"
                        />
                      </div>
                    </div>

                    {uploadError && (
                      <p
                        className="text-sm text-red-400"
                        role="alert"
                      >
                        {uploadError}
                      </p>
                    )}

                    {uploadMessage && (
                      <p
                        className="text-sm text-green-400"
                        role="status"
                      >
                        {uploadMessage}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={uploading}
                      className="rounded-full bg-green-500 px-6 py-3 font-bold text-black transition hover:bg-green-400 disabled:opacity-50"
                    >
                      {uploading
                        ? "Uploading..."
                        : "Upload Song"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Music library filters */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
              <button
                type="button"
                onClick={() => setView("home")}
                className={`px-4 sm:px-5 py-2 rounded-full text-sm font-semibold ${
                  view === "home"
                    ? "bg-white text-black"
                    : "bg-[#282828] hover:bg-[#383838]"
                }`}
              >
                All Songs
              </button>

              <button
                type="button"
                onClick={() => setView("liked")}
                className={`px-4 sm:px-5 py-2 rounded-full text-sm font-semibold ${
                  view === "liked"
                    ? "bg-green-500 text-black"
                    : "bg-[#282828] hover:bg-[#383838]"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.6 5 5.9 5c2 0 3.4 1.1 4.1 2.3C10.7 6.1 12.1 5 14.1 5c3.3 0 5 3.4 3.5 6.8C19.5 16.4 12 21 12 21z" />
                  </svg>
                  Liked Songs
                </span>
              </button>

              <button
                type="button"
                onClick={() => setView("recent")}
                className={`px-4 sm:px-5 py-2 rounded-full text-sm font-semibold ${
                  view === "recent"
                    ? "bg-green-500 text-black"
                    : "bg-[#282828] hover:bg-[#383838]"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  Recently Played
                </span>
              </button>
            </div>

            {/* Search */}
            {view === "home" && (
              <div className="mb-7 sm:mb-8">
                <label
                  htmlFor="music-search"
                  className="block text-lg sm:text-xl font-bold mb-3"
                >
                  Find your music
                </label>

                <div className="relative max-w-2xl">
                  <svg
                    viewBox="0 0 24 24"
                    className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>

                  <input
                    id="music-search"
                    type="search"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Search songs or artists..."
                    className="w-full rounded-full bg-[#202020] pl-12 pr-5 sm:pr-6 py-3 sm:py-4 text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>
            )}

            <h2 className="text-xl sm:text-2xl font-bold mb-5">
              {sectionTitle}
            </h2>

            {loading ? (
              <p className="text-gray-400">Loading songs...</p>
            ) : displayedSongs.length === 0 ? (
              <div className="bg-[#181818] rounded-xl p-6 sm:p-8 text-center">
                <p className="text-4xl mb-3">🎵</p>

                <h3 className="text-lg font-semibold">
                  {view === "liked"
                    ? "No liked songs yet"
                    : view === "recent"
                      ? "No recently played songs"
                      : "No songs found"}
                </h3>

                <p className="text-gray-400 mt-2 text-sm sm:text-base">
                  {view === "liked"
                    ? "Heart icon dabakar songs like karo."
                    : view === "recent"
                      ? "Koi song play karo; woh yahan dikhega."
                      : "Doosra song title ya artist search karo."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
                {displayedSongs.map((music) => {
                  const originalIndex = musics.findIndex(
                    (item) => item._id === music._id
                  );

                  return (
                    <SongCard
                      key={music._id}
                      music={music}
                      isPlaying={
                        currentIndex === originalIndex &&
                        isPlaying
                      }
                      onPlay={() => playSong(originalIndex)}
                      isLiked={likedIds.has(music._id)}
                      onToggleLike={toggleLike}
                    />
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Bottom Music Player (Spotify style) */}
      {isLoggedIn && currentMusic && (
        <>
          <PlayerBar
            music={currentMusic}
            image={currentSongImage}
            isPlaying={isPlaying}
            isLiked={likedIds.has(currentMusic._id)}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            onTogglePlay={togglePlay}
            onNext={playNext}
            onPrevious={playPrevious}
            onSeek={handleSeek}
            onToggleLike={toggleLike}
            onVolumeChange={handleVolumeChange}
            isShuffle={isShuffle}
            repeatMode={repeatMode}
            onToggleShuffle={toggleShuffle}
            onToggleRepeat={toggleRepeat}
            formatTime={formatTime}
          />

          <audio
            ref={audioRef}
            src={currentMusic.uri}
            preload="metadata"
            onTimeUpdate={(event) =>
              setCurrentTime(event.currentTarget.currentTime)
            }
            onLoadedMetadata={(event) => {
              event.currentTarget.volume = volume;
              setDuration(event.currentTarget.duration);
            }}
            onEnded={handleEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => setIsPlaying(false)}
          />
        </>
      )}
    </div>
  );
}

export default App;

function Navbar({ isLoggedIn, username, onLogout, onMenuClick }) {
  const goBack = () => window.history.back();
  const goForward = () => window.history.forward();

  const initial = username?.trim()?.[0]?.toUpperCase() || "U";

  return (
    <header className="w-full flex items-center justify-between gap-3 py-2">
      {/* Menu button: only on mobile, opens the sidebar drawer */}
      {isLoggedIn ? (
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full
          bg-[#181818] border border-white/10 text-gray-300
          hover:text-[#1ed760] active:scale-95 transition md:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
        </button>
      ) : (
        <span className="md:hidden" />
      )}

      {/* Back / forward: only on desktop */}
      <div className="hidden items-center gap-3 md:flex">
        <button
          type="button"
          onClick={goBack}
          aria-label="Go back"
          title="Go Back"
          className="w-11 h-11 rounded-full flex items-center justify-center
          bg-[#181818] border border-white/10 text-gray-300
          hover:bg-[#252525] hover:text-[#1ed760]
          hover:border-[#1ed760]/50 hover:scale-105
          active:scale-95 transition-all duration-200"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <button
          type="button"
          onClick={goForward}
          aria-label="Go forward"
          title="Go Forward"
          className="w-11 h-11 rounded-full flex items-center justify-center
          bg-[#181818] border border-white/10 text-gray-300
          hover:bg-[#252525] hover:text-[#1ed760]
          hover:border-[#1ed760]/50 hover:scale-105
          active:scale-95 transition-all duration-200"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {isLoggedIn && (
        <div className="flex items-center gap-3">
          {/* Username pill */}
          <div
            className="flex items-center gap-2 rounded-full
            bg-[#181818] border border-white/10 py-1.5 pl-1.5 pr-4"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1ed760] text-sm font-bold text-black">
              {initial}
            </span>

            <span className="max-w-[100px] truncate text-sm text-gray-200 sm:max-w-[140px]">
              <span className="hidden sm:inline">Hi, </span>
              {username || "User"}
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="rounded-full bg-white text-black px-4 sm:px-5 py-2
            font-semibold text-sm hover:bg-[#1ed760]
            active:scale-95 transition-all duration-200"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

export default Navbar;

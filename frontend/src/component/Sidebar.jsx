import logo from "../assets/EraBeats.png";

const icons = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h5v-6h4v6h5V9.5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  library: (
    <>
      <path d="M4 4v16" />
      <path d="M8 8v12" />
      <path d="M12 6v14" />
      <path d="m16 6 4 14" />
    </>
  ),
};

function NavIcon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function Sidebar({ activePage = "home", onNavigate }) {
  const navItems = [
    { id: "home", label: "Home" },
    { id: "search", label: "Search" },
    { id: "library", label: "Your Library" },
  ];

  const handleNavigation = (page) => {
    if (onNavigate) onNavigate(page);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-60 flex-col bg-black p-5">
        <button
          type="button"
          onClick={() => handleNavigation("home")}
          className="mb-8 flex justify-center"
          aria-label="EraBeats home"
        >
          <img
            src={logo}
            alt="EraBeats Playlist"
            className="w-full max-w-[230px] h-auto object-contain scale-110"
          />
        </button>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavigation(item.id)}
              className={`flex w-full items-center gap-4 rounded-lg px-3 py-3 text-left transition ${
                activePage === item.id
                  ? "bg-[#242424] text-white font-semibold"
                  : "text-gray-400 hover:bg-[#181818] hover:text-white"
              }`}
            >
              <NavIcon name={item.id} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <p className="text-xs text-gray-500">
            Your music, your mood ♫
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[60] grid grid-cols-3 border-t border-white/10 bg-[#101010]/95 px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))] backdrop-blur-lg">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavigation(item.id)}
            className={`flex flex-col items-center justify-center gap-1 rounded-lg py-2 text-xs transition ${
              activePage === item.id
                ? "text-green-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <NavIcon name={item.id} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

export default Sidebar;

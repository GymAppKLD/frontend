import { useTheme } from "../context/ThemeContext";

export default function Topbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="topbar">
      <div className="search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        Search exercises, workouts...
      </div>
      <div className="topbar-right">
        <div className="theme-toggle">
          <div
            className={`opt${theme === "light" ? " active" : ""}`}
            title="Light mode"
            onClick={() => setTheme("light")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </div>
          <div
            className={`opt${theme === "dark" ? " active" : ""}`}
            title="Dark mode"
            onClick={() => setTheme("dark")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
            </svg>
          </div>
        </div>
        <div className="bell">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
        </div>
        <div className="user">
          <div className="avatar">G</div>
          <div className="user-name">Gabriel</div>
        </div>
      </div>
    </header>
  );
}
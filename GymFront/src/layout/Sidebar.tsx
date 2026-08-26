import { NavLink } from "react-router-dom";

interface NavItem {
  to: string;
  label: string;
  icon: string; // SVG path(s) content
}

const MAIN_NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: '<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>' },
  { to: "/workouts", label: "Workouts", icon: '<path d="M6.5 6.5l11 11M4 8l4-4 2 2-4 4-2-2zm10 10l4-4 2 2-4 4-2-2zM9 9l2 2m2 2l2 2"/>' },
  { to: "/exercises", label: "Exercises", icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>' },
  { to: "/history", label: "History", icon: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 8v4l3 2"/>' },
  { to: "/progress", label: "Progress", icon: '<path d="M3 17l5-5 4 4 8-9"/><path d="M14 7h6v6"/>' },
  { to: "/goals", label: "Goals", icon: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>' },
];

const FOOTER_NAV: NavItem[] = [
  { to: "/settings", label: "Settings", icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>' },
];

function NavRow({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        dangerouslySetInnerHTML={{ __html: item.icon }}
      />
      {item.label}
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">K</div>
        <div className="brand-name">Kfit</div>
      </div>

      <div className="nav-group">
        {MAIN_NAV.map((item) => (
          <NavRow key={item.to} item={item} />
        ))}
      </div>

      <div className="nav-divider" />

      <div className="nav-group">
        {FOOTER_NAV.map((item) => (
          <NavRow key={item.to} item={item} />
        ))}
      </div>
    </aside>
  );
}
import { useState } from "react";
import { NavLink } from "react-router-dom";

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const MAIN_NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: '<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>' },
  { to: "/workouts", label: "Workouts", icon: '<path d="M6.5 6.5l11 11M4 8l4-4 2 2-4 4-2-2zm10 10l4-4 2 2-4 4-2-2zM9 9l2 2m2 2l2 2"/>' },
  { to: "/exercises", label: "Exercises", icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>' },
  { to: "/progress", label: "Progress", icon: '<path d="M3 17l5-5 4 4 8-9"/><path d="M14 7h6v6"/>' },
  { to: "/goals", label: "Goals", icon: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>' },
];

const FOOTER_NAV: NavItem[] = [
  { to: "/settings", label: "Settings", icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>' },
];

function NavRow({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
      title={collapsed ? item.label : undefined}
      style={collapsed ? { justifyContent: "center", padding: "12px 0" } : undefined}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: collapsed ? "center" : undefined }}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ width: 18, height: 18, flexShrink: 0 }}
          dangerouslySetInnerHTML={{ __html: item.icon }}
        />
        {!collapsed && item.label}
      </div>
      {!collapsed && <div className="nav-led" style={{ width: 6, height: 6, borderRadius: 3, background: "var(--accent)", opacity: 0, transition: "opacity 0.2s", boxShadow: "0 0 8px var(--accent)" }}></div>}
    </NavLink>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className="sidebar" style={{ background: "#060607", borderRight: "1px solid var(--border)", width: collapsed ? 72 : 260, flexShrink: 0, transition: "width 0.22s ease" }}>
      <div className="brand" style={{ background: "#060607", justifyContent: collapsed ? "center" : "space-between", padding: collapsed ? "0 12px" : "0 16px 0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="brand-mark" style={{ color: "#060607", display: "flex", alignItems: "center", justifyContent: "center" }}>K</div>
          {!collapsed && <div className="brand-name">KFit</div>}
        </div>
        <button onClick={() => setCollapsed((v) => !v)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="M15 18l-6-6 6-6" /></svg>
        </button>
      </div>

      <div className="nav-group" style={{ paddingTop: 24, alignItems: collapsed ? "center" : undefined }}>
        {MAIN_NAV.map((item) => (
          <NavRow key={item.to} item={item} collapsed={collapsed} />
        ))}
      </div>

      <div className="nav-divider" style={{ opacity: 0.5 }} />

      <div className="nav-group" style={{ alignItems: collapsed ? "center" : undefined }}>
        {FOOTER_NAV.map((item) => (
          <NavRow key={item.to} item={item} collapsed={collapsed} />
        ))}
      </div>
    </aside>
  );
}

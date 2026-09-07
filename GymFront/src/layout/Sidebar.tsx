import { useState } from "react";
import { NavLink } from "react-router-dom";
import { usePreferences } from "../context/PreferencesContext";

interface NavItem {
  to: string;
  labelKey: string;
  icon: string;
}

const MAIN_NAV: NavItem[] = [
  { to: "/", labelKey: "dashboard", icon: '<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>' },
  { to: "/workouts", labelKey: "workouts", icon: '<path d="M6.5 6.5l11 11M4 8l4-4 2 2-4 4-2-2zm10 10l4-4 2 2-4 4-2-2zM9 9l2 2m2 2l2 2"/>' },
  { to: "/exercises", labelKey: "exercises", icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>' },
  { to: "/progress", labelKey: "progress", icon: '<path d="M3 17l5-5 4 4 8-9"/><path d="M14 7h6v6"/>' },
  { to: "/goals", labelKey: "goals", icon: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>' },
];

function NavRow({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const { t } = usePreferences();
  const label = t(item.labelKey);
  if (collapsed) {
    return (
      <NavLink
        to={item.to}
        end={item.to === "/"}
        className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
        title={label}
        style={{ width: 40, height: 40, minHeight: 40, borderRadius: 6, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ width: 20, height: 20 }}
          dangerouslySetInnerHTML={{ __html: item.icon }}
        />
      </NavLink>
    );
  }
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ width: 18, height: 18, flexShrink: 0 }}
          dangerouslySetInnerHTML={{ __html: item.icon }}
        />
        {label}
      </div>
      <div className="nav-led" style={{ width: 6, height: 6, borderRadius: 3, background: "var(--accent)", opacity: 0, transition: "opacity 0.2s", boxShadow: "0 0 8px var(--accent)" }}></div>
    </NavLink>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className="sidebar" style={{ background: "var(--frame)", borderRight: "1px solid var(--border)", width: collapsed ? 72 : 260, flexShrink: 0, transition: "width 0.22s ease" }}>
      <div
        className="brand"
        onClick={() => setCollapsed((v) => !v)}
        role="button"
        title={collapsed ? "Expand" : "Collapse"}
        style={{ background: "var(--frame)", justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "0 12px" : "0 24px", cursor: "pointer" }}
      >
        <div className="brand-mark" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#060607", fontFamily: "var(--mono)" }}>K</div>
        {!collapsed && <div className="brand-name" style={{ marginLeft: 4 }}>KFit</div>}
      </div>

      <div className="nav-group" style={{ paddingTop: 24, alignItems: collapsed ? "center" : undefined }}>
        {MAIN_NAV.map((item) => (
          <NavRow key={item.to} item={item} collapsed={collapsed} />
        ))}
      </div>
    </aside>
  );
}

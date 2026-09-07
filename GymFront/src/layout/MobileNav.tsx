import { NavLink } from "react-router-dom";
import { usePreferences } from "../context/PreferencesContext";

interface NavItem {
  to: string;
  labelKey: string;
  icon: string;
}

const MOBILE_NAV: NavItem[] = [
  { to: "/", labelKey: "dashboard", icon: '<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>' },
  { to: "/workouts", labelKey: "workouts", icon: '<path d="M6.5 6.5l11 11M4 8l4-4 2 2-4 4-2-2zm10 10l4-4 2 2-4 4-2-2zM9 9l2 2m2 2l2 2"/>' },
  { to: "/exercises", labelKey: "exercises", icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>' },
  { to: "/progress", labelKey: "progress", icon: '<path d="M3 17l5-5 4 4 8-9"/><path d="M14 7h6v6"/>' },
  { to: "/goals", labelKey: "goals", icon: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>' },
];

export default function MobileNav() {
  const { t } = usePreferences();
  return (
    <nav className="mobile-nav">
      {MOBILE_NAV.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.to === "/"} className={({ isActive }) => (isActive ? "active" : "")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" dangerouslySetInnerHTML={{ __html: item.icon }} />
          <span>{t(item.labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}

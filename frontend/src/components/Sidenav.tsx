import {
  LayoutDashboard,
  User,
  DollarSign,
  LogOut,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout } from "@/store/auth/authSlice";
import React from "react";

const NAV_ITEMS = [
  { to: "/dashboard", text: "Overview", icon: <LayoutDashboard size={18} /> },
  { to: "/profile", text: "Profile", icon: <User size={18} /> },
  { to: "/revenue", text: "Revenue", icon: <DollarSign size={18} /> },
];

const NavItem = ({
  icon,
  text,
  to,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  to: string;
  active?: boolean;
  onClick?: () => void;
}) => {
  return (
    <Link
      to={to}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`
        flex items-center gap-3 px-4 py-2 text-sm rounded-xl font-medium transition-colors
        ${active
          ? "bg-accent/20 text-accent"
          : "text-muted hover:bg-neutral-800 hover:text-light"}
      `}
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
};

const LogoMark: React.FC = () => (
  <svg width="36" height="36" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad-sidebar" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6CB4FF" />
        <stop offset="50%" stopColor="#9C6CFF" />
        <stop offset="100%" stopColor="#D36CFF" />
      </linearGradient>
    </defs>
    <g stroke="url(#grad-sidebar)" strokeWidth="12" strokeLinecap="round">
      <line x1="40" y1="120" x2="40" y2="80" />
      <rect x="32" y="90" width="16" height="40" rx="4" fill="url(#grad-sidebar)" />
      <line x1="75" y1="140" x2="75" y2="60" />
      <rect x="67" y="80" width="16" height="60" rx="4" fill="url(#grad-sidebar)" />
      <line x1="110" y1="130" x2="110" y2="85" />
      <rect x="102" y="95" width="16" height="35" rx="4" fill="url(#grad-sidebar)" />
      <line x1="145" y1="150" x2="145" y2="55" />
      <rect x="137" y="75" width="16" height="75" rx="4" fill="url(#grad-sidebar)" />
      <line x1="180" y1="135" x2="180" y2="75" />
      <rect x="172" y="85" width="16" height="50" rx="4" fill="url(#grad-sidebar)" />
    </g>
  </svg>
);

export default function Sidenav() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const signOut = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside className="h-screen w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col justify-between">
      {/* Top Section */}
      <div className="px-6 pt-6 space-y-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <LogoMark />
          <span className="text-xl font-bold text-light tracking-wide">TUDENGIBAAR</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-2">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.to}
              icon={item.icon}
              text={item.text}
              to={item.to}
              active={pathname.startsWith(item.to)}
            />
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="px-6 pb-6">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted hover:text-white hover:bg-neutral-800 rounded-xl transition"
        >
          <LogOut size={18} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

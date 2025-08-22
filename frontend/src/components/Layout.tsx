import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Sidenav from "./Sidenav";
import AnalyticsBackground from "./AnalyticsBackground";
import DiamondDotGridBackground from "./DiamondDotGridBackground";

type LayoutProps = {
  children: ReactNode;
  header?: ReactNode;
};

const AUTH_PATHS = ["/login", "/register"];

export default function Layout({ children, header }: LayoutProps) {
  const { pathname } = useLocation();
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isAuthPage) {
    return (
      <div className="bg-dark text-light min-h-screen">
        <main className="p-6">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-dark text-light min-h-screen">
      <Sidenav />
      <div className="flex-1 flex flex-col">
        {header && (
          <div className="p-6 border-b border-neutral-800">{header}</div>
        )}
        <DiamondDotGridBackground />
        <AnalyticsBackground />
        <main className="flex-1 p-6 bg-dark text-light">
          {children}
        </main>

        <footer className="p-4 text-center text-sm text-muted border-t border-neutral-800">
          © {new Date().getFullYear()} Tudengibaar. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

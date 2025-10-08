import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  const navLinks = [
    { to: "/history", label: "History", icon: "📊" },
    { to: "/returnedProduct", label: "Returned Products", icon: "📦" },
    { to: "/addProducts", label: "Add Product", icon: "➕" },
    { to: "/updateProducts", label: "Update Product", icon: "🔄" },
    { to: "/deleteProduct", label: "Delete Product", icon: "🗑️" }
  ];

  return (
    <header
      className={`w-full sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-b from-gray-900/90 to-gray-950/70 border-b border-gray-800 rounded-b-3xl transition-shadow duration-500 ${
        scrolled
          ? "shadow-2xl shadow-cyan-700/30 border-cyan-600/40"
          : "shadow-md shadow-transparent border-gray-800/40"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-3 flex items-center justify-between">
        {/* Logo / Brand */}
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="flex items-center gap-3 group select-none"
            onClick={() => setOpen(false)}
            aria-label="Home"
          >
            <div className="relative p-0.5">
              <div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500/90 via-cyan-400 to-blue-500/90 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-500/70 group-hover:shadow-blue-600/95 transition-all duration-400 group-hover:scale-110"
                aria-hidden="true"
              >
                DB
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-fuchsia-400 via-cyan-300 to-blue-400 opacity-25 blur-xl transition-opacity duration-300 -z-10" />
            </div>
            <span className="hidden sm:inline-block text-3xl font-extrabold tracking-wide bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400 bg-clip-text text-transparent">
              DBMS
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative flex items-center gap-1 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 group select-none ${
                  isActive
                    ? "text-cyan-300 bg-gray-800/70 border border-cyan-500/60 shadow-md shadow-cyan-700/40"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/95"
                }`
              }
              end
            >
              {({ isActive }) => (
                <>
                  <span className="text-lg leading-none">{link.icon}</span>
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute bottom-1 left-2 right-2 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-400 rounded-full shadow-lg shadow-cyan-600/70 animate-pulse"
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Right Section - User Placeholder and Mobile Menu */}
        
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height,opacity,padding] duration-500 ease-in-out border-t border-gray-800 bg-gray-900/90 ${
          open ? "max-h-screen py-4 opacity-100" : "max-h-0 py-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col space-y-2 px-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 rounded-2xl text-base font-semibold transition-colors duration-300 select-none ${
                  isActive
                    ? "bg-gray-800 border border-cyan-500/60 shadow-cyan-700/20 text-cyan-300 shadow-md"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`
              }
              onClick={() => setOpen(false)}
              end
            >
              <span className="text-xl">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

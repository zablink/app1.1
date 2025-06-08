// /src/components/Navbar.tsx

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isLoggedIn = false; // เปลี่ยนตามสถานะ login จริงของคุณ

  // ตรวจจับการ scroll เพื่อเปลี่ยนสีพื้นหลัง navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
        scrolled ? "bg-white shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <a
                className={`text-2xl font-bold transition-colors duration-300 ${
                  scrolled ? "text-primary" : "text-white"
                }`}
              >
                MyLogo
              </a>
            </Link>
          </div>

          {/* Hamburger button (mobile) */}
          <div className="sm:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors duration-300 ${
                scrolled ? "text-primary hover:bg-primary/10" : "text-white hover:bg-white/20"
              }`}
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">เปิดเมนูหลัก</span>
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>

          {/* Menu items desktop */}
          <div className="hidden sm:flex space-x-6 items-center">
            {!isLoggedIn ? (
              <>
                <Link href="/login">
                  <a
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                      scrolled
                        ? "text-primary hover:bg-primary/10"
                        : "text-white hover:bg-white/20"
                    }`}
                  >
                    Login
                  </a>
                </Link>
                <Link href="/signup">
                  <a className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors duration-300">
                    Sign Up
                  </a>
                </Link>
              </>
            ) : (
              <button
                onClick={() => {
                  /* ฟังก์ชัน logout */
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                  scrolled
                    ? "text-primary hover:bg-primary/10"
                    : "text-white hover:bg-white/20"
                }`}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu with slide down/up animation */}
      <div
        className={`sm:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          isOpen ? "max-h-60" : "max-h-0"
        } bg-white shadow-md`}
        id="mobile-menu"
      >
        <div className="px-4 pt-2 pb-4 space-y-1">
          {!isLoggedIn ? (
            <>
              <Link href="/login">
                <a
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-primary/10 transition-colors duration-200"
                >
                  Login
                </a>
              </Link>
              <Link href="/signup">
                <a
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary hover:bg-primary-dark transition-colors duration-200"
                >
                  Sign Up
                </a>
              </Link>
            </>
          ) : (
            <button
              onClick={() => {
                setIsOpen(false);
                /* ฟังก์ชัน logout */
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-primary/10 transition-colors duration-200"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

// /src/components/NavbarNew.tsx
// Updated NavbarNew.tsx with shared role-based menu for desktop and mobile
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
// Import FiUser, FiMenu, FiX, FiChevronDown, FiSettings, FiHome, FiSearch, FiLogIn, FiLogOut
import { FiUser, FiMenu, FiX, FiChevronDown, FiSettings, FiHome, FiSearch, FiLogIn, FiLogOut } from "react-icons/fi";

// ตัวอย่างหมวดหมู่ร้านค้า
const categories = ["อาหารญี่ปุ่น", "ชานมไข่มุก", "อาหารตามสั่ง"];

export default function Navbar() {
  const { data: session } = useSession();
  // isLoggedIn is true if a session exists
  const isLoggedIn = !!session;
  // Get role from session, default to "user" if not present
  const role = session?.user?.role || "user";
  // Get user avatar URL from session, if available
  const userAvatar = session?.user?.image;

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Effect to handle scroll behavior
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Effect to focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Effect to close dropdowns when clicking outside (for desktop Shop Dropdown)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside Shop Dropdown
      if (shopDropdownOpen && !(event.target as HTMLElement).closest(".group")) {
        setShopDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [shopDropdownOpen]);

  // Functions to open/close UIs
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Close other dropdowns when opening/closing mobile menu
    setShopDropdownOpen(false);
  };
  const toggleShopDropdown = () => setShopDropdownOpen(!shopDropdownOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);
  
  // Handlers for Login and Logout using NextAuth
  const handleLogin = () => signIn("google", { callbackUrl: "/" });
  const handleLogout = () => signOut({ callbackUrl: "/" });

  // Determine the correct settings path based on the user's role
  const getSettingsPath = (userRole: string) => {
    if (userRole === 'shop') {
      return '/dashboard/shop/settings';
    }
    if (userRole === 'admin') {
      return '/admin/settings';
    }
    return '/settings'; // Default for 'user' role
  };

  // Function to render role-specific dashboard menus (only for Shop and Admin)
  // User Role will not have specific dashboard menus here, managed via Profile Dropdown
  const renderRoleSpecificDashboardMenus = (userRole: string, isMobile = false, onClick?: () => void) => {
    const baseClass = isMobile
      ? "block px-3 py-2 hover:bg-gray-700 rounded"
      : "text-white hover:text-primary";

    const wrap = (href: string, text: string, icon?: React.ReactNode) => (
      <Link href={href} key={href}>
        <a onClick={onClick} className={`${baseClass} flex items-center space-x-2`}>
            {icon && icon}
            <span>{text}</span>
        </a>
      </Link>
    );

    if (userRole === "shop") {
      return (
        <>
          {wrap("/dashboard/shop", "แดชบอร์ดร้านค้า", <FiHome size={20} />)}
          {wrap("/dashboard/menus", "จัดการเมนู")}
          {wrap("/dashboard/promotion", "โปรโมทร้าน")}
          {wrap("/dashboard/reports", "รายงานร้านค้า")}
        </>
      );
    }

    if (userRole === "admin") {
      return (
        <>
          {wrap("/admin/dashboard", "แดชบอร์ดผู้ดูแล", <FiHome size={20} />)} {/* Add Admin dashboard link */}
          {wrap("/admin/shops", "จัดการร้านค้า")}
          {wrap("/admin/users", "จัดการผู้ใช้")}
          {wrap("/admin/promotions", "จัดการโปรโมชั่น")}
          {wrap("/admin/ads", "จัดการโฆษณา")}
          {wrap("/admin/reviews", "จัดการรีวิว")} {/* Add review management */}
          {wrap("/admin/reports", "รายงานรวม")}
          {wrap("/admin/categories", "จัดการหมวดหมู่")} {/* Add category management */}
          {wrap("/admin/settings", "ตั้งค่าระบบ")} {/* Add system settings */}
        </>
      );
    }

    // For 'user' role or other roles, no specific Dashboard menus here
    return null;
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full transition-colors duration-300 bg-gradient-to-b from-[#04ddd6b3] to-[#03A6A1b3] ${
          scrolled ? "shadow-lg" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <a className="flex items-center">
                <img
                  src="/images/zablink-logo-white.png" // Ensure this path is correct
                  alt="Zablink Logo"
                  className="h-8 w-auto sm:h-16"
                />
              </a>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-6">
              {/* Shop Dropdown (Restaurant Categories) */}
              <div className="relative group">
                <div className="inline-flex items-center text-white hover:text-primary cursor-pointer">
                  <span>ร้านค้า</span>
                  <FiChevronDown className="ml-1" />
                </div>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <ul>
                    {categories.map((cat) => (
                      <li key={cat}>
                        <Link href={`/shop/category/${encodeURIComponent(cat)}`}>
                          <a className="block px-4 py-2 hover:bg-gray-100 text-gray-800">{cat}</a>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Static Links */}
              <Link href="/about">
                <a className="text-white hover:text-primary">เกี่ยวกับเรา</a>
              </Link>
              <Link href="/contact">
                <a className="text-white hover:text-primary">ติดต่อเรา</a>
              </Link>

              {/* Role-based Dashboard Menus (for Shop and Admin) */}
              {isLoggedIn && renderRoleSpecificDashboardMenus(role)}

              {/* Search Button */}
              <button onClick={toggleSearch} aria-label="Search" className="text-white hover:text-primary focus:outline-none">
                <FiSearch size={20} />
              </button>

              {/* Login/User Profile Dropdown based on login status */}
              {!isLoggedIn ? (
                // Login Button for Desktop
                <Link href="/login">
                  <a // Use <a> instead of <button> inside Link for semantic HTML
                    aria-label="Login"
                    className="text-white hover:text-primary focus:outline-none font-medium px-2"
                    title="เข้าสู่ระบบ"
                  >
                    เข้าสู่ระบบ
                  </a>
                </Link>
              ) : (
                // User Profile Dropdown for Desktop (opens on hover)
                <div className="relative group user-profile-dropdown-container">
                  <button
                    aria-label="User Profile"
                    className="text-white hover:text-primary focus:outline-none flex items-center space-x-1"
                    title="โปรไฟล์ผู้ใช้"
                  >
                    {/* Conditionally render avatar image or FiUser icon */}
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <FiUser size={20} />
                    )}
                    <FiChevronDown className="ml-1" />
                  </button>
                  {/* Dropdown Content (shows on group-hover) */}
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <ul>
                      {/* Link to Settings/Profile page for all Roles */}
                      <li>
                        <Link href={getSettingsPath(role)}>
                          <a className="block px-4 py-2 hover:bg-gray-100 text-gray-800 flex items-center space-x-2">
                            <FiSettings size={18} />
                            <span>ตั้งค่าโปรไฟล์</span>
                          </a>
                        </Link>
                      </li>
                      {/* "Become a Shop" for User Role only */}
                      {role === "user" && (
                        <li>
                          <Link href="/register-shop"> {/* Assuming there's a page for shop registration */}
                            <a className="block px-4 py-2 hover:bg-gray-100 text-gray-800 flex items-center space-x-2">
                              <FiUser size={18} /> {/* Can use another icon that signifies a shop */}
                              <span>เป็นร้านค้า</span>
                            </a>
                          </Link>
                        </li>
                      )}
                      {/* Logout Button */}
                      <li>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800 flex items-center space-x-2 border-t border-gray-200"
                        >
                          <FiLogOut size={18} />
                          <span>ออกจากระบบ</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Navigation Toggle */}
            <div className="sm:hidden flex items-center space-x-3">
              <button onClick={toggleSearch} aria-label="Search" className="text-white hover:text-primary focus:outline-none">
                <FiSearch size={24} />
              </button>
              <button onClick={toggleMobileMenu} aria-label="Toggle menu" className="text-white hover:text-primary focus:outline-none">
                {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-black bg-opacity-90 backdrop-blur-md shadow-lg">
            <ul className="flex flex-col space-y-1 p-4 text-white">
              {/* Mobile Shop Dropdown (Restaurant Categories) */}
              <li>
                <button onClick={toggleShopDropdown} className="flex justify-between w-full items-center px-3 py-2 hover:bg-gray-700 rounded">
                  <span>ร้านค้า</span>
                  <FiChevronDown />
                </button>
                {shopDropdownOpen && (
                  <ul className="pl-4 mt-1 space-y-1">
                    {categories.map((cat) => (
                      <li key={cat}>
                        <Link href={`/shop/category/${encodeURIComponent(cat)}`}>
                          <a onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 hover:bg-gray-700 rounded">
                            {cat}
                          </a>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
              {/* Mobile Static Links */}
              <li>
                <Link href="/about">
                  <a onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 hover:bg-gray-700 rounded">
                    เกี่ยวกับเรา
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 hover:bg-gray-700 rounded">
                    ติดต่อเรา
                  </a>
                </Link>
              </li>

              {/* Mobile Role-based Dashboard Menus (for Shop and Admin) */}
              {isLoggedIn && renderRoleSpecificDashboardMenus(role, true, () => setMobileMenuOpen(false))}

              {/* Mobile User Profile/Settings & Logout */}
              <li className="border-t border-gray-700 pt-2">
                {!isLoggedIn ? (
                  // Mobile Login Button
                  <Link href="/login">
                    <a // Use <a> instead of <button> inside Link
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 hover:bg-gray-700 rounded w-full text-left">
                      เข้าสู่ระบบ
                    </a>
                  </Link>
                ) : (
                  <>
                    {/* Mobile Settings Link */}
                    {/* Use getSettingsPath to determine the link based on Role */}
                    <Link href={getSettingsPath(role)}>
                      <a onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-700 rounded">
                        <FiSettings size={20} />
                        <span>ตั้งค่าโปรไฟล์</span>
                      </a>
                    </Link>
                    {/* "Become a Shop" for User Role only (Mobile) */}
                    {role === "user" && (
                      <Link href="/register-shop">
                        <a onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-700 rounded">
                          <FiUser size={20} />
                          <span>เป็นร้านค้า</span>
                        </a>
                      </Link>
                    )}
                    {/* Mobile Logout Button */}
                    <button
                      onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                      className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-700 rounded w-full mt-1 text-left"
                    >
                      <FiLogOut size={20} />
                      <span>ออกจากระบบ</span>
                    </button>
                  </>
                )}
              </li>
            </ul>
          </div>
        )}

        {/* Search Overlay */}
        {searchOpen && (
          <div onClick={() => setSearchOpen(false)} className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50">
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-md p-4 w-11/12 max-w-md">
              <input ref={searchInputRef} type="text" placeholder="ค้นหา..." className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-800" />
              <button onClick={() => setSearchOpen(false)} className="mt-3 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                ค้นหา
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

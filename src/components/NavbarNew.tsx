// /src/components/NavbarNew.tsx
// Updated NavbarNew.tsx with shared role-based menu for desktop and mobile
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
// เพิ่ม FiSettings เข้ามาใน import
import { FiSearch, FiLogIn, FiLogOut, FiUser, FiMenu, FiX, FiChevronDown, FiSettings } from "react-icons/fi";

const categories = ["อาหารญี่ปุ่น", "ชานมไข่มุก", "อาหารตามสั่ง"];

export default function Navbar() {
  const { data: session } = useSession();
  // isLoggedIn เป็นจริงถ้ามี session
  const isLoggedIn = !!session;
  // ดึง role จาก session, ถ้าไม่มีจะใช้ "user" เป็นค่าเริ่มต้น
  const role = session?.user?.role || "user"; 

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Effect สำหรับจัดการพฤติกรรมการเลื่อนหน้าจอ
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Effect สำหรับโฟกัสช่องค้นหาเมื่อเปิด
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // ฟังก์ชันสำหรับเปิด/ปิด UI ต่างๆ
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleShopDropdown = () => setShopDropdownOpen(!shopDropdownOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);
  
  // Handlers สำหรับ Login และ Logout โดยใช้ NextAuth
  // callbackUrl เป็นสิ่งสำคัญสำหรับกำหนดหน้าที่จะถูก Redirect ไปหลัง Login สำเร็จ
  const handleLogin = () => signIn("google", { callbackUrl: "/" }); // Login ด้วย Google แล้ว Redirect ไปหน้าแรก
  const handleLogout = () => signOut({ callbackUrl: "/" }); // Logout แล้ว Redirect ไปหน้าแรก

  // ฟังก์ชันสำหรับแสดงเมนูตามบทบาทของผู้ใช้
  const renderRoleMenus = (userRole: string, isMobile = false, onClick?: () => void) => {
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
          {wrap("/dashboard/shop", "จัดการร้าน")}
          {wrap("/dashboard/menus", "เมนูสินค้า")}
          {wrap("/dashboard/promotion", "โปรโมทร้าน")}
          {wrap("/dashboard/reports", "รายงาน")}
        </>
      );
    }

    if (userRole === "admin") {
      return (
        <>
          {wrap("/admin/shops", "จัดการร้านค้า")}
          {wrap("/admin/users", "จัดการผู้ใช้")}
          {wrap("/admin/promotions", "จัดการโปรโมชั่น")}
          {wrap("/admin/ads", "จัดการโฆษณา")}
          {wrap("/admin/reports", "รายงานรวม")}
        </>
      );
    }

    // ไม่มีเมนูเฉพาะบทบาทสำหรับ 'user' หรือบทบาทอื่นๆ
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
                  src="/images/zablink-logo-white.png"
                  alt="Zablink Logo"
                  className="h-8 w-auto sm:h-16"
                />
              </a>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-6">
              {/* Shop Dropdown */}
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
                          <a className="block px-4 py-2 hover:bg-gray-100">{cat}</a>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Static Links */}
              <Link href="/about">
                <a className="text-white hover:text-primary">About</a>
              </Link>
              <Link href="/contact">
                <a className="text-white hover:text-primary">Contact</a>
              </Link>

              {/* Role-based Menus (แสดงเฉพาะเมื่อล็อกอินแล้ว) */}
              {isLoggedIn && renderRoleMenus(role)}

              {/* Search Button */}
              <button onClick={toggleSearch} aria-label="Search" className="text-white hover:text-primary focus:outline-none">
                <FiSearch size={20} />
              </button>

              {/* Login/Logout/Settings ตามสถานะการล็อกอิน */}
              {!isLoggedIn ? (
                // ปุ่ม Login สำหรับ Desktop
                <Link href="/login">
                  <a // ใช้ <a> แทน <button> ภายใน Link เพื่อความถูกต้องของ Semantic HTML
                    aria-label="Login"
                    className="text-white hover:text-primary focus:outline-none font-medium px-2"
                    title="Login"
                  >
                    Login
                  </a>
                </Link>
              ) : (
                <>
                  {/* ไอคอน/ลิงก์ Settings สำหรับ Desktop (สำหรับผู้ใช้ที่ล็อกอินแล้ว) */}
                  <Link href="/settings"> {/* เปลี่ยนจาก /dashboard เป็น /settings */}
                    <a
                      aria-label="Settings"
                      className="text-white hover:text-primary focus:outline-none font-medium flex items-center space-x-1"
                      title="Settings"
                    >
                      <FiSettings size={20} />
                    </a>
                  </Link>

                  {/* ปุ่ม Logout สำหรับ Desktop */}
                  <button
                    onClick={handleLogout}
                    aria-label="Logout"
                    className="text-white hover:text-primary focus:outline-none ml-4 font-medium"
                    title="Logout"
                  >
                    <FiLogOut size={24} />
                  </button>
                </>
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
              {/* Mobile Shop Dropdown */}
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
                    About
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 hover:bg-gray-700 rounded">
                    Contact
                  </a>
                </Link>
              </li>

              {/* Mobile Role-based Menus (แสดงเฉพาะเมื่อล็อกอินแล้ว) */}
              {isLoggedIn && renderRoleMenus(role, true, () => setMobileMenuOpen(false))}

              {/* Mobile Login/Logout/Settings ตามสถานะการล็อกอิน */}
              <li className="border-t border-gray-700 pt-2">
                {!isLoggedIn ? (
                  // Mobile Login Button
                  <Link href="/login">
                    <a // ใช้ <a> แทน <button> ภายใน Link
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 hover:bg-gray-700 rounded w-full text-left">
                      Login
                    </a>
                  </Link>
                ) : (
                  <>
                    {/* Mobile Settings Link */}
                    <Link href="/settings"> {/* เปลี่ยนจาก /dashboard เป็น /settings */}
                      <a onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-700 rounded">
                        <FiSettings size={20} />
                        <span>Settings</span> {/* เพิ่มข้อความเพื่อให้ชัดเจนบน Mobile */}
                      </a>
                    </Link>
                    {/* Mobile Logout Button */}
                    <button
                      onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                      className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-700 rounded w-full mt-1 text-left"
                    >
                      <FiLogOut size={20} />
                      <span>Logout</span> {/* เพิ่มข้อความเพื่อให้ชัดเจนบน Mobile */}
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
              <input ref={searchInputRef} type="text" placeholder="Search..." className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
              <button onClick={() => setSearchOpen(false)} className="mt-3 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                Search
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
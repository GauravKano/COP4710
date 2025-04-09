import { Link, useNavigate } from "react-router";
import navDropDown from "../assets/navDropdown.svg.svg";
import { useEffect, useRef, useState } from "react";

const Navbar: React.FC<{ loggedIn: boolean }> = ({ loggedIn }) => {
  const navigate = useNavigate();
  const [navDropdownOpen, setNavDropdownOpen] = useState<boolean>(false);
  const navDropdown = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeDropdown = (event: MouseEvent) => {
      if (!navDropdown.current?.contains(event.target as Node)) {
        event.stopPropagation();
        setNavDropdownOpen(false);
      }
    };

    if (navDropdownOpen) {
      document.addEventListener("click", closeDropdown, true);
    }

    return () => {
      document.removeEventListener("click", closeDropdown, true);
    };
  }, [navDropdownOpen]);

  const handleLogout = () => {
    document.cookie = `userId=; path=/`;
    document.cookie = `userEmail=; path=/`;
    document.cookie = `username=; path=/`;
    document.cookie = `userType=; path=/`;
    document.cookie = `universityId=; path=/`;
    document.cookie = `token=; path=/`;

    navigate("/login");
  };

  return (
    <nav className="py-3.5 pl-7 pr-5 bg-gray-300 flex items-center align-middle">
      <span className="font-semibold text-xl mr-5 text-nowrap">COP4710</span>

      <div className="hidden md:flex items-center gap-3.5 grow">
        <Link to="/dashboard">
          <button className="px-2 py-1.5 rounded-lg hover:bg-gray-400 cursor-pointer">
            Dashboard
          </button>
        </Link>
        <Link to="/rsos">
          <button className="px-2 py-1.5 rounded-lg hover:bg-gray-400 cursor-pointer">
            RSOs
          </button>
        </Link>
        <Link to="/super-admin-dashboard">
          <button className="px-2 py-1.5 rounded-lg hover:bg-gray-400 cursor-pointer">
            Super Admin
          </button>
        </Link>
        {!loggedIn ? (
          <>
            <Link to="/login" className="ml-auto">
              <button className="px-3 py-1.5 rounded-lg hover:bg-gray-400 border cursor-pointer">
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="px-3 py-1.5 rounded-lg hover:bg-gray-400 border cursor-pointer">
                Register
              </button>
            </Link>
          </>
        ) : (
          <button
            className="px-3 py-1.5 rounded-lg hover:bg-gray-400 border cursor-pointer ml-auto"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </div>

      <div className="md:hidden ml-auto relative">
        <button
          className="px-3 py-1.5 rounded-lg hover:bg-gray-400 cursor-pointer"
          onClick={() => setNavDropdownOpen(true)}
        >
          <img className="w-6 h-6" src={navDropDown} alt="Nav Dropdown Icon" />
        </button>

        {navDropdownOpen && (
          <div
            ref={navDropdown}
            className="z-20 absolute top-full right-0 flex flex-col border rounded-lg bg-gray-300 text-nowrap text-center"
          >
            <Link to="/dashboard">
              <button className="w-full px-5 py-2.5 hover:bg-gray-400 border-b cursor-pointer">
                Dashboard
              </button>
            </Link>
            <Link to="/rsos">
              <button className="w-full px-5 py-2.5 hover:bg-gray-400 border-b cursor-pointer">
                RSOs
              </button>
            </Link>
            <Link to="/super-admin-dashboard">
              <button className="w-full px-5 py-2.5 hover:bg-gray-400 border-b cursor-pointer">
                Super Admin
              </button>
            </Link>
            {!loggedIn ? (
              <>
                <Link to="/login">
                  <button className="w-full px-5 py-2.5 hover:bg-gray-400 border-b cursor-pointer">
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <button className="w-full px-5 py-2.5 hover:bg-gray-400 cursor-pointer">
                    Register
                  </button>
                </Link>
              </>
            ) : (
              <button
                className="w-full px-5 py-2.5 hover:bg-gray-400 cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

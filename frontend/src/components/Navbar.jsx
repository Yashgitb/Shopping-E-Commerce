import { useContext, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContextValue'

const Navbar = () => {
  const [visible, setVisible] = useState(false)
  const { setShowSearch, getCartCount, user, logout } = useContext(ShopContext)

  return (
    <div className="flex items-center justify-between py-5 font-medium relative">
      <Link to="/">
        <img src={assets.logo} className="w-36" alt="Forever" />
      </Link>

      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <NavLink to="/" className="flex flex-col items-center gap-1">
          {({ isActive }) => (
            <>
              <p>HOME</p>
              <hr className={`w-2/4 border-none h-[1.5px] bg-gray-700 ${isActive ? 'block' : 'hidden'}`} />
            </>
          )}
        </NavLink>
        <NavLink to="/collection" className="flex flex-col items-center gap-1">
          {({ isActive }) => (
            <>
              <p>COLLECTION</p>
              <hr className={`w-2/4 border-none h-[1.5px] bg-gray-700 ${isActive ? 'block' : 'hidden'}`} />
            </>
          )}
        </NavLink>
        <NavLink to="/about" className="flex flex-col items-center gap-1">
          {({ isActive }) => (
            <>
              <p>ABOUT</p>
              <hr className={`w-2/4 border-none h-[1.5px] bg-gray-700 ${isActive ? 'block' : 'hidden'}`} />
            </>
          )}
        </NavLink>
        <NavLink to="/contact" className="flex flex-col items-center gap-1">
          {({ isActive }) => (
            <>
              <p>CONTACT</p>
              <hr className={`w-2/4 border-none h-[1.5px] bg-gray-700 ${isActive ? 'block' : 'hidden'}`} />
            </>
          )}
        </NavLink>
      </ul>

      <div className="flex items-center gap-6">
        <Link
          to="/admin"
          className="hidden sm:block px-5 py-1 text-xs rounded-full border border-gray-400 text-gray-600"
        >
          Admin Panel
        </Link>
        <img
          onClick={() => setShowSearch(true)}
          src={assets.search_icon}
          className="w-5 cursor-pointer"
          alt="Search"
        />
        <div className="group relative">
          <Link to={user ? '/account' : '/login'}>
            <img className="w-5 cursor-pointer" src={assets.profile_icon} alt="Account" />
          </Link>
          <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4">
            <div className="flex flex-col gap-2 w-40 py-3 px-5 bg-slate-100 text-gray-500 rounded">
              <Link to="/account" className="cursor-pointer hover:text-black">
                My Account
              </Link>
              <Link to="/orders" className="cursor-pointer hover:text-black">
                Orders
              </Link>
              {user ? (
                <button type="button" onClick={logout} className="text-left cursor-pointer hover:text-black">
                  Logout
                </button>
              ) : (
                <Link to="/login" className="cursor-pointer hover:text-black">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
        <Link to="/cart" className="relative">
          <img src={assets.cart_icon} className="w-5 min-w-5" alt="Cart" />
          <p className="absolute right-1.25 bottom-1.25 w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
            {getCartCount()}
          </p>
        </Link>
        <img
          onClick={() => setVisible(true)}
          src={assets.menu_icon}
          className="w-5 cursor-pointer sm:hidden"
          alt="Menu"
        />
      </div>

      <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
        <div className="flex flex-col text-gray-600">
          <div onClick={() => setVisible(false)} className="flex items-center gap-4 p-3 cursor-pointer">
            <img className="h-4 rotate-180" src={assets.dropdown_icon} alt="" />
            <p>Back</p>
          </div>
          <NavLink onClick={() => setVisible(false)} className="py-2 pl-6 border" to="/">
            HOME
          </NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-2 pl-6 border" to="/collection">
            COLLECTION
          </NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-2 pl-6 border" to="/about">
            ABOUT
          </NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-2 pl-6 border" to="/contact">
            CONTACT
          </NavLink>
        </div>
      </div>
    </div>
  )
}

export default Navbar

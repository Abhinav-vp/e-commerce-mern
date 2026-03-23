import React, { useContext, useState } from 'react'
import "./Navbar.css"
import logo from '../Assets/Frontend_Assets/logo.png'
import cart_icon from '../Assets/Frontend_Assets/cart_icon.png'
import { Link } from 'react-router-dom'
import { ShopContext } from '../../context/ShopContext'

const Navbar = () => {

  const [menu, setMenu] = useState("shop");
  const [menuOpen, setMenuOpen] = useState(false);

  const { getTotalCartItems } = useContext(ShopContext);

  const toggleMenu = () => setMenuOpen(prev => !prev);

  const handleNavClick = (target) => {
    setMenu(target);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    window.location.replace("/");
  };

  const isLoggedIn = !!localStorage.getItem("auth-token");

  return (
    <div className='navbar'>

      <div className="nav_logo">
        <img src={logo} alt="" />
        <p>SHOPPER</p>
      </div>

      <button className={`nav_hamburger ${menuOpen ? 'open' : ''}`} onClick={toggleMenu} aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul className={`nav_menu ${menuOpen ? 'nav_menu--active' : ''}`}>
        <li onClick={() => handleNavClick("shop")}><Link style={{ textDecoration: 'none' }} to={'/'}>Shop</Link>{menu === "shop" ? <hr /> : <></>}</li>
        <li onClick={() => handleNavClick("mens")}><Link style={{ textDecoration: 'none' }} to={'/mens'}>Men</Link> {menu === "mens" ? <hr /> : <></>}</li>
        <li onClick={() => handleNavClick("womens")}><Link style={{ textDecoration: 'none' }} to={'/womens'}>Women</Link> {menu === "womens" ? <hr /> : <></>}</li>
        <li onClick={() => handleNavClick("kids")}><Link style={{ textDecoration: 'none' }} to={'/kids'}>Kids</Link> {menu === "kids" ? <hr /> : <></>}</li>
      </ul>

      <div className="nav_cart">
        {isLoggedIn ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <Link to={'/login'}><button>Login</button></Link>
        )}
        <Link to={'/cart'}><img className="cart_icon" src={cart_icon} alt="" /></Link>
        <div className="nav_cart-count">{getTotalCartItems()}</div>
      </div>

    </div>
  )
}

export default Navbar
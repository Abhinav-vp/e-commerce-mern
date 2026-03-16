import React, { useState } from 'react'
import "./Navbar.css"
import logo from '../Assets/Frontend_Assets/logo.png'
import cart_icon from '../Assets/Frontend_Assets/cart_icon.png'
import { Link } from 'react-router-dom'

const Navbar = () => {

  const  [menu,setMenu] = useState("shop");
  return (
    <div className='navbar'>

      <div className="nav_logo">
        <img src={logo} alt="" />
        <p>SHOPPER</p>
      </div>

      <ul className="nav_menu">
        <li onClick={()=>{setMenu("shop")}}><Link style={{textDecoration:'none'}} to={'/'}>Shop</Link>{menu==="shop"?<hr/>:<></>}</li>
        <li onClick={()=>{setMenu("mens")}}><Link style={{textDecoration:'none'}}  to={'/mens'}>Men</Link> {menu==="mens"?<hr/>:<></>}</li>
        <li onClick={()=>{setMenu("womens")}}><Link style={{textDecoration:'none'}}  to={'/womens'}>Women</Link> {menu==="womens"?<hr/>:<></>}</li>
        <li onClick={()=>{setMenu("kids")}}><Link style={{textDecoration:'none'}}  to={'/kids'}>Kids</Link> {menu==="kids"?<hr/>:<></>}</li>
      </ul>

      <div className="nav_cart">
       <Link to={'/login'}><button>Login</button></Link> 
        <Link to={'/cart'}><img className="cart_icon" src={cart_icon} alt="" /></Link>
        <div className="nav_cart-count">0</div>
      </div>

    </div>
  )
}

export default Navbar
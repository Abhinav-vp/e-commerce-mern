import React, { useContext } from 'react'
import './Item.css'
import { Link } from 'react-router-dom'
import { ShopContext } from '../../context/ShopContext'

const Item = (props) => {
  const { addToCart, toggleWishlist, isInWishlist } = useContext(ShopContext);
  const isLoggedIn = !!localStorage.getItem("auth-token");
  const isWishlisted = isInWishlist(props.id);

  return (
    <div className='item'>
      <Link to={`/product/${props.id}`}>
        <div className="item-img-container">
          <img 
            onClick={() => window.scrollTo(0, 0)} 
            src={props.thumbnail || props.image || 'https://images.rawpixel.com/image_png_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvczg0LXRlZC0xNTg3OWEucG5n.png'} 
            alt={props.name} 
            onError={(e) => {
              if (e.target.src.includes('rawpixel.com')) {
                e.target.onerror = null;
                return;
              }
              if (e.target.src !== props.image && props.image) {
                e.target.src = props.image;
              } else {
                e.target.src = 'https://images.rawpixel.com/image_png_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvczg0LXRlZC0xNTg3OWEucG5n.png';
                e.target.onerror = null;
              }
            }}
          />
        </div>
      </Link>

      {isLoggedIn && (
        <button 
          className={`item-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(props.id);
          }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isWishlisted ? '♥' : '♡'}
        </button>
      )}

      <div className="item-details">
        <p className="item-name">{props.name}</p>

        <div className="item-prices">
          <div className="item-prices-left">
            <span className="item-price-new">
              ₹{props.new_price}
            </span>
            <span className="item-price-old">
              ₹{props.old_price}
            </span>
          </div>
          {isLoggedIn && (
            <button 
              className="item-add-cart-btn" 
              onClick={(e) => {
                e.preventDefault();
                addToCart(props.id);
              }}
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Item
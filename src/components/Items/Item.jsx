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
            src={props.thumbnail || props.image} 
            alt={props.name} 
            onError={(e) => {
              e.target.src = props.image;
              e.target.onerror = null;
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
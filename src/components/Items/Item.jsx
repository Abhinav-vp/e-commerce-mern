import React, { useContext } from 'react'
import './Item.css'
import { Link } from 'react-router-dom'
import { ShopContext } from '../../context/ShopContext'

const Item = (props) => {
  const { addToCart } = useContext(ShopContext);
  const isLoggedIn = !!localStorage.getItem("auth-token");

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
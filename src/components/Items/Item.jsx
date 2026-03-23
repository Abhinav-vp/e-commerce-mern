import React from 'react'
import './Item.css'
import { Link } from 'react-router-dom'

const Item = (props) => {
  return (
    <div className='item'>
      <Link to={`/product/${props.id}`}>
        <div className="item-img-container">
          <img 
            onClick={() => window.scrollTo(0, 0)} 
            src={props.image} 
            alt={props.name} 
          />
        </div>
      </Link>

      <div className="item-details">
        <p className="item-name">{props.name}</p>

        <div className="item-prices">
          <span className="item-price-new">
            ₹{props.new_price}
          </span>
          <span className="item-price-old">
            ₹{props.old_price}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Item
import React, { useContext } from 'react'
import './CSS/Wishlist.css'
import { ShopContext } from '../context/ShopContext'
import Item from '../components/Items/Item'
import { Link } from 'react-router-dom'

const Wishlist = () => {
  const { all_product, wishlistItems } = useContext(ShopContext);

  const wishlistProducts = all_product.filter(product => 
    wishlistItems.includes(product.id)
  );

  return (
    <div className='wishlist'>
      <div className="wishlist-container">
        <h1>My Wishlist <span>({wishlistProducts.length})</span></h1>
        
        {wishlistProducts.length > 0 ? (
          <div className="wishlist-products">
            {wishlistProducts.map((item) => (
              <Item
                key={item.id}
                id={item.id}
                name={item.name}
                image={item.image}
                thumbnail={item.thumbnail}
                new_price={item.new_price}
                old_price={item.old_price}
              />
            ))}
          </div>
        ) : (
          <div className="wishlist-empty">
            <div className="empty-heart">♡</div>
            <h2>Your wishlist is empty</h2>
            <p>Save items that you like in your wishlist to review them later.</p>
            <Link to='/'>
              <button>Start Shopping</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist

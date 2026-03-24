import React, { useContext, useState } from 'react'
import './CSS/ShopCategory.css'
import { ShopContext } from '../context/ShopContext'
import dropdown_icon from '../components/Assets/Frontend_Assets/dropdown_icon.png'
import Item from '../components/Items/Item'

const ShopCategory = (props) => {
  const { all_product } = useContext(ShopContext);

  const [visibleCount, setVisibleCount] = useState(8);

 
  const totalProducts = all_product.filter(
    (item) => props.category === item.category
  ).length;

  return (
    <div className='shop-category'>
      <img className='shopcategory-banner' src={props.banner} alt="" />

      <div className="shopcategory-indexSort">
        <p>
          <span>Showing 1-{visibleCount}</span> out of {totalProducts} products
        </p>

        <div className="shopcategory-Sort">
          Sort by <img src={dropdown_icon} alt="" />
        </div>
      </div>

      <div className="shopcategory-products">
        {all_product
          .filter((item) => props.category === item.category) 
          .slice(0, visibleCount) 
          .map((item, i) => (
            <Item
              key={i}
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))}
      </div>

      
      {visibleCount < totalProducts && (
        <div className="shopcategory-loadmore">
          <button onClick={() => setVisibleCount(totalProducts)}>
            Explore More
          </button>
        </div>
      )}
    </div>
  )
}

export default ShopCategory
import React, { useContext } from 'react'
import './ProductDisplay.css'
import star_icon from '../Assets/Frontend_Assets/star_icon.png'
import star_dull_icon from '../Assets/Frontend_Assets/star_dull_icon.png'
import { ShopContext } from '../../context/ShopContext'

const ProductDisplay = (props) => {
    const {product}=props;
    const {addToCart} =useContext(ShopContext);
  return (
    <div className='productdisplay'>
      <div className="productdisplay-left">
         <div className="productdisplay-img-list">
            <img src={product.image} alt="" />
            <img src={product.image} alt="" />
            <img src={product.image} alt="" />
            <img src={product.image} alt="" />
         </div>
         <div className="productdisplay-image">
            <img className='productdisplay-main-img' src={product.image} alt="" />
         </div>
      </div>
      <div className="productdisplay-right">
         <h1>{product.name}</h1>
         <div className="productdisplay-right-star">
            <img src={star_icon} alt="" />
            <img src={star_icon} alt="" />
            <img src={star_icon} alt="" />
            <img src={star_icon} alt="" />
            <img src={star_dull_icon} alt="" />
            <p>(158)</p>
         </div>
         <div className="productdisplay-right-prices">
            <div className="productdisplay-right-price-old">{product.old_price}</div>
            <div className="productdisplay-right-price-new">{product.new_price}</div>
         </div>
         <div className="productdisplay-right-description">

**Description:**
Upgrade your everyday style with this premium cotton t-shirt, designed for maximum comfort and durability. Made from 100% high-quality cotton, this t-shirt offers a soft feel against the skin while ensuring breathability throughout the day. Its modern fit and minimalist design make it perfect for casual outings, workouts, or layering with your favorite outfits.

The fabric is lightweight yet strong, providing long-lasting wear even after multiple washes. Available in multiple colors and sizes, this t-shirt is a versatile addition to any wardrobe.
</div>
          <div className="productdisplay-right-size">
            <h1>Select Size</h1>
            <div className="productdisplay-right-size">
                <div>S</div>
                <div>M</div>
                <div>L</div>
                <div>Xl</div>
                <div>XXl</div>
            </div>
          </div>
          <button onClick={()=>{addToCart(product.id)}}>ADD TO CART</button>
          <p className='productdisplay-right-category'><span>Category:</span>Women , T-Shirt , Crop Top</p>
          <p className='productdisplay-right-category'><span>Tags:</span>Modern , Latest</p>
      </div>
    </div>
  )
}

export default ProductDisplay

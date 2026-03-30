import React, { useContext, useState, useEffect } from 'react'
import './ProductDisplay.css'
import star_icon from '../Assets/Frontend_Assets/star_icon.png'
import star_dull_icon from '../Assets/Frontend_Assets/star_dull_icon.png'
import { ShopContext } from '../../context/ShopContext'

const ProductDisplay = (props) => {
    const { product } = props;
    const { addToCart } = useContext(ShopContext);
    
    // Track which image is currently showing in the main display
    const [mainImage, setMainImage] = useState(product.image);

    // Sync main image when product changes (e.g. navigating between products)
    useEffect(() => {
        setMainImage(product.image);
    }, [product]);

    // Construct the list of images to show in thumbnails
    // We want to show the main image + any sub_images (up to 4 total)
    const displayImages = [
        { main: product.image, thumb: product.thumbnail || product.image },
        ...(product.sub_images || []).map((img, i) => ({
            main: img,
            thumb: (product.sub_thumbnails && product.sub_thumbnails[i]) || img
        }))
    ].slice(0, 4);

    // Fill remaining slots to maintain the 4-thumbnail grid if needed
    while (displayImages.length > 0 && displayImages.length < 4) {
        displayImages.push(displayImages[0]);
    }

    return (
        <div className='productdisplay'>
            <div className="productdisplay-left">
                <div className="productdisplay-img-list">
                    {displayImages.map((img, index) => (
                        <img 
                            key={index}
                            src={img.thumb} 
                            alt={`angle-${index}`} 
                            onClick={() => setMainImage(img.main)}
                            className={mainImage === img.main ? 'active-thumb' : ''}
                            onError={(e) => {
                                e.target.src = img.main;
                                e.target.onerror = null;
                            }}
                        />
                    ))}
                </div>
                <div className="productdisplay-image">
                    <img 
                        className='productdisplay-main-img' 
                        src={mainImage} 
                        alt="" 
                        onError={(e) => {
                            // If main image fails, we don't have a specific fallback here
                            // but we can try the first available sub_image if needed.
                            // For now, just prevent infinite loops.
                            e.target.onerror = null;
                        }}
                    />
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

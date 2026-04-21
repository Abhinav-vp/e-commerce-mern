import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import './CartItem.css'
import { ShopContext } from '../../context/ShopContext'
import remove_icon from '../Assets/Frontend_Assets/cart_cross_icon.png'

const CartItem = () => {
    const { getTotalCartAmount, all_product, cartItems, removeFromCart } = useContext(ShopContext);
    const navigate = useNavigate();
    return (
        <div className='cartitem'>
            <div className="cartitems-format-main">
                <p>Products</p>
                <p>Title</p>
                <p>Size</p>
                <p>Price</p>
                <p>Quantity</p>
                <p>Total</p>
                <p>Remove</p>
            </div>
            <hr />
            {Object.entries(cartItems).filter(([_, qty]) => qty > 0).length === 0 ? (
                <div className="cartitems-empty-message">
                    <h2>Your cart is empty</h2>
                    <p>Add some products to see them here!</p>
                </div>
            ) : (
                Object.entries(cartItems).map(([key, quantity]) => {
                    if (quantity > 0) {
                        const itemId = key.includes('_') ? key.split('_')[0] : key;
                        const size = key.includes('_') ? key.split('_')[1] : "";
                        const e = all_product.find((product) => product.id === Number(itemId));
                        
                        if (e) {
                            return (
                                <div key={key}>
                                    <div className="cartitems-format">
                                        <img 
                                            src={e.thumbnail || e.image} 
                                            alt="" 
                                            className='carticon-product-icon' 
                                            onError={(img) => {
                                                img.target.src = e.image;
                                                img.target.onerror = null;
                                            }}
                                        />
                                        <p>{e.name}</p>
                                        <p>{size}</p>
                                        <p>{e.new_price}</p>
                                        <button className='cart-items-quantity'>{quantity}</button>
                                        <p>{e.new_price * quantity}</p>
                                        <img 
                                            className='cartitems-remove-icon' 
                                            src={remove_icon} 
                                            alt="" 
                                            onClick={() => { removeFromCart(itemId, size) }} 
                                        />
                                    </div>
                                    <hr />
                                </div>
                            );
                        }
                    }
                    return null;
                })
            )}
            <div className="cartitems-down">
                <div className="cartitems-total">
                    <h1>Cart Totals</h1>
                    <div>
                        <div className="cartitems-total-item">
                            <p>Sub Total</p>
                            <p>{getTotalCartAmount()}</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <p>Shipping Fee</p>
                            <p>Free</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <h3>Total</h3>
                            <h3>{getTotalCartAmount()}</h3>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate("/placeorder")} 
                        disabled={getTotalCartAmount() === 0}
                        className={getTotalCartAmount() === 0 ? 'disabled' : ''}
                    >
                        PROCEED TO CHECKOUT
                    </button>
                </div>
                <div className="cartitems-promocode">
                    <p>If you have a promocode , Enter it here</p>
                    <div className="cartitem-promobox">
                        <input type="text" placeholder='promo code' />
                        <button>Submit</button>
                    </div>
                </div>
            </div>


        </div>
    )
}

export default CartItem

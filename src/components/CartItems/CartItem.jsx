import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CartItem.css'
import { ShopContext, API_BASE } from '../../context/ShopContext'
import remove_icon from '../Assets/Frontend_Assets/cart_cross_icon.png'

const CartItem = () => {
    const { getTotalCartAmount, all_product, cartItems, removeFromCart, promoCode, promoDiscount, applyPromo, clearPromo } = useContext(ShopContext);
    const navigate = useNavigate();
    const [promoInput, setPromoInput] = useState('');
    const [promoMessage, setPromoMessage] = useState('');
    const [promoError, setPromoError] = useState(false);
    const [promoLoading, setPromoLoading] = useState(false);

    const subtotal = getTotalCartAmount();
    const total = Math.max(0, subtotal - promoDiscount);

    const handleApplyPromo = async () => {
        if (!promoInput.trim()) return;

        const token = localStorage.getItem('auth-token');
        if (!token) {
            setPromoError(true);
            setPromoMessage('Please login to use promo codes');
            return;
        }

        setPromoLoading(true);
        setPromoMessage('');
        setPromoError(false);

        try {
            const response = await fetch(`${API_BASE}/api/promo/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token,
                },
                body: JSON.stringify({ code: promoInput, subtotal }),
            });

            const data = await response.json();

            if (data.success) {
                applyPromo(data.code, data.discount);
                setPromoMessage(data.message);
                setPromoError(false);
            } else {
                clearPromo();
                setPromoMessage(data.message);
                setPromoError(true);
            }
        } catch (err) {
            setPromoMessage('Failed to validate promo code');
            setPromoError(true);
        } finally {
            setPromoLoading(false);
        }
    };

    const handleRemovePromo = () => {
        clearPromo();
        setPromoInput('');
        setPromoMessage('');
        setPromoError(false);
    };

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
            {Object.entries(cartItems).filter(([, qty]) => qty > 0).length === 0 ? (
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
                            <p>${subtotal.toFixed(2)}</p>
                        </div>
                        <hr />
                        {promoDiscount > 0 && (
                            <>
                                <div className="cartitems-total-item promo-discount-row">
                                    <p>Discount ({promoCode})</p>
                                    <p className="discount-value">-${promoDiscount.toFixed(2)}</p>
                                </div>
                                <hr />
                            </>
                        )}
                        <div className="cartitems-total-item">
                            <p>Shipping Fee</p>
                            <p>Free</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <h3>Total</h3>
                            <h3>${total.toFixed(2)}</h3>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate("/placeorder")} 
                        disabled={subtotal === 0}
                        className={subtotal === 0 ? 'disabled' : ''}
                    >
                        PROCEED TO CHECKOUT
                    </button>
                </div>
                <div className="cartitems-promocode">
                    <p>If you have a promo code, enter it here</p>
                    <div className="cartitem-promobox">
                        <input 
                            type="text" 
                            placeholder='Promo code' 
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                            disabled={!!promoCode}
                        />
                        {promoCode ? (
                            <button onClick={handleRemovePromo} className="promo-remove-btn">Remove</button>
                        ) : (
                            <button onClick={handleApplyPromo} disabled={promoLoading}>
                                {promoLoading ? 'Checking...' : 'Apply'}
                            </button>
                        )}
                    </div>
                    {promoMessage && (
                        <p className={`promo-message ${promoError ? 'promo-error' : 'promo-success'}`}>
                            {promoMessage}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CartItem

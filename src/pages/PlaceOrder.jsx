import React, { useContext, useState, useEffect } from 'react'
import './PlaceOrder.css'
import { ShopContext, API_BASE } from '../context/ShopContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useModal } from '../context/ModalContext'

const PlaceOrder = () => {
    const { getTotalCartAmount, all_product, cartItems, promoCode, promoDiscount, clearPromo } = useContext(ShopContext);
    const { showModal } = useModal();
    const navigate = useNavigate();

    const subtotal = getTotalCartAmount();
    const total = Math.max(0, subtotal - promoDiscount);

    useEffect(() => {
        if (subtotal === 0) {
            navigate('/cart');
        }
    }, [subtotal, navigate]);

    const [method, setMethod] = useState('cod');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: ''
    })

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setFormData(data => ({ ...data, [name]: value }))
    }

    const initPay = (order) => {
        const options = {
            key: process.env.REACT_APP_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'Order Payment',
            description: 'Order Payment',
            order_id: order.id,
            handler: async (response) => {
                try {
                    const { data } = await axios.post(`${API_BASE}/api/orders/verifyRazorpay`, { ...response, orderId: order.receipt }, { headers: { 'auth-token': localStorage.getItem('auth-token') } });
                    if (data.success) {
                        clearPromo();
                        navigate('/myorders');
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            let orderItems = [];
            Object.entries(cartItems).forEach(([key, quantity]) => {
                if (quantity > 0) {
                    const itemId = key.includes('_') ? key.split('_')[0] : key;
                    const size = key.includes('_') ? key.split('_')[1] : "";
                    const item = all_product.find((p) => p.id === Number(itemId));
                    if (item) {
                        const itemInfo = structuredClone(item);
                        itemInfo.quantity = quantity;
                        itemInfo.size = size;
                        orderItems.push(itemInfo);
                    }
                }
            })

            if (orderItems.length === 0) {
                showModal({ title: 'Empty Cart', message: "Your cart is empty. Please add items before placing an order." });
                return;
            }

            let orderData = {
                address: formData,
                items: orderItems,
                amount: subtotal,
                paymentMethod: method === 'cod' ? 'COD' : 'Razorpay',
                promoCode: promoCode || undefined,
            }

            const response = await axios.post(`${API_BASE}/api/orders/place`, orderData, { headers: { 'auth-token': localStorage.getItem('auth-token') } });

            if (response.data.success) {
                clearPromo();
                if (method === 'cod') {
                    navigate('/myorders');
                } else {
                    initPay(response.data.order);
                }
            } else {
                showModal({ title: 'Order Error', message: response.data.message });
            }

        } catch (error) {
            console.log(error);
            showModal({ title: 'Error', message: error.message });
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='place-order'>
            <div className="place-order-left">
                <p className='title'>Delivery Information</p>
                <div className="multi-fields">
                    <input required name='firstName' onChange={onChangeHandler} value={formData.firstName} type="text" placeholder='First name' />
                    <input required name='lastName' onChange={onChangeHandler} value={formData.lastName} type="text" placeholder='Last name' />
                </div>
                <input required name='email' onChange={onChangeHandler} value={formData.email} type="email" placeholder='Email address' />
                <input required name='street' onChange={onChangeHandler} value={formData.street} type="text" placeholder='Street' />
                <div className="multi-fields">
                    <input required name='city' onChange={onChangeHandler} value={formData.city} type="text" placeholder='City' />
                    <input required name='state' onChange={onChangeHandler} value={formData.state} type="text" placeholder='State' />
                </div>
                <div className="multi-fields">
                    <input required name='zipcode' onChange={onChangeHandler} value={formData.zipcode} type="number" placeholder='Zip code' />
                    <input required name='country' onChange={onChangeHandler} value={formData.country} type="text" placeholder='Country' />
                </div>
                <input required name='phone' onChange={onChangeHandler} value={formData.phone} type="number" placeholder='Phone' />
            </div>
            <div className="place-order-right">
                <div className="cartitems-total">
                    <h1>Cart Totals</h1>
                    <div>
                        <div className="cartitems-total-item">
                            <p>Subtotal</p>
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
                </div>
                <div className="payment-method">
                    <p className='title'>Payment Method</p>
                    <div className="payment-options">
                        <div onClick={() => setMethod('razorpay')} className={`payment-option ${method === 'razorpay' ? 'active' : ''}`}>
                            <p>Razorpay</p>
                        </div>
                        <div onClick={() => setMethod('cod')} className={`payment-option ${method === 'cod' ? 'active' : ''}`}>
                            <p>Cash on Delivery</p>
                        </div>
                    </div>
                    <button type='submit' className='place-order-btn'>PLACE ORDER</button>
                </div>
            </div>
        </form>
    )
}

export default PlaceOrder

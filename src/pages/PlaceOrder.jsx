import React, { useContext, useState } from 'react'
import './PlaceOrder.css'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const PlaceOrder = () => {
    const { getTotalCartAmount, all_product, cartItems } = useContext(ShopContext);
    const navigate = useNavigate();
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
                    const { data } = await axios.post('http://localhost:4000/api/orders/verifyRazorpay', { ...response, orderId: order.receipt }, { headers: { 'auth-token': localStorage.getItem('auth-token') } });
                    if (data.success) {
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
            all_product.forEach((item) => {
                if (cartItems[item.id] > 0) {
                    const itemInfo = structuredClone(item);
                    itemInfo.quantity = cartItems[item.id];
                    orderItems.push(itemInfo);
                }
            })

            let orderData = {
                address: formData,
                items: orderItems,
                amount: getTotalCartAmount(),
                paymentMethod: method === 'cod' ? 'COD' : 'Razorpay'
            }

            const response = await axios.post('http://localhost:4000/api/orders/place', orderData, { headers: { 'auth-token': localStorage.getItem('auth-token') } });

            if (response.data.success) {
                if (method === 'cod') {
                    navigate('/myorders');
                } else {
                    initPay(response.data.order);
                }
            } else {
                alert(response.data.message);
            }

        } catch (error) {
            console.log(error);
            alert(error.message);
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
                            <p>${getTotalCartAmount()}</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <p>Shipping Fee</p>
                            <p>Free</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <h3>Total</h3>
                            <h3>${getTotalCartAmount()}</h3>
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

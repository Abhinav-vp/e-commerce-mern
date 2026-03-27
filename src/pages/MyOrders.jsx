import React, { useEffect, useState } from 'react'
import './MyOrders.css'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import parcel_icon from '../components/Assets/Frontend_Assets/parcel_icon.png'

const MyOrders = () => {
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/orders/userorders', { headers: { 'auth-token': localStorage.getItem('auth-token') } });
            if (response.data.success) {
                setOrders(response.data.orders.reverse());
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchOrders();
    }, [])

    return (
        <div className='my-orders'>
            <h2>My Orders</h2>
            <div className="container">
                {orders.map((order, index) => {
                    return (
                        <div key={index} className="my-orders-order">
                            <img src={parcel_icon} alt="" />
                            <p>{order.items.map((item, index) => {
                                if (index === order.items.length - 1) {
                                    return item.name + " x " + item.quantity
                                } else {
                                    return item.name + " x " + item.quantity + ", "
                                }
                            })}</p>
                            <p>${order.amount}.00</p>
                            <p>Items: {order.items.length}</p>
                            <p><span>&#x25cf;</span> <b>{order.status}</b></p>
                            <button onClick={fetchOrders}>Track Order</button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default MyOrders

import React, { useEffect } from 'react'
import './CSS/Verify.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { API_BASE } from '../context/ShopContext'
import axios from 'axios'

const Verify = () => {
    const [searchParams] = useSearchParams();
    const success = searchParams.get("success");
    const orderId = searchParams.get("orderId");
    const navigate = useNavigate();

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const response = await axios.post(`${API_BASE}/api/orders/verifyStripe`, { success, orderId }, { headers: { 'auth-token': localStorage.getItem('auth-token') } });
                if (response.data.success) {
                    navigate("/myorders");
                } else {
                    navigate("/");
                }
            } catch (error) {
                console.log(error);
                navigate("/");
            }
        }
        verifyPayment();
    }, [success, orderId, navigate])

    return (
        <div className='verify'>
            <div className="spinner"></div>
        </div>
    )
}

export default Verify

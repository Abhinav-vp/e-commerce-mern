import React, { useState, useEffect } from "react";
import "./CSS/Referral.css";

const API_BASE = process.env.REACT_APP_API_BASE || `http://${window.location.hostname}:7000`;

const Referral = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/auth/me`, {
                    method: "GET",
                    headers: {
                        "auth-token": localStorage.getItem("auth-token"),
                        "Content-Type": "application/json",
                    },
                });
                const data = await response.json();
                if (data.success) {
                    setUserData(data.user);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(userData.referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="referral-loading">Loading...</div>;
    if (!userData) return <div className="referral-error">Please login to see your referral info.</div>;

    return (
        <div className="referral">
            <div className="referral-container">
                <h1>Refer & Earn</h1>
                <p>Invite your friends to SHOPPER and earn reward points!</p>
                
                <div className="referral-stats">
                    <div className="stat-card">
                        <h3>Your Points</h3>
                        <p className="stat-value">{userData.rewardPoints}</p>
                    </div>
                </div>

                <div className="referral-code-section">
                    <h2>Your Unique Referral Code</h2>
                    <div className="code-box">
                        <span>{userData.referralCode}</span>
                        <button onClick={copyToClipboard}>
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                </div>

                <div className="referral-info">
                    <h3>How it works:</h3>
                    <ul>
                        <li>Share your referral code with friends.</li>
                        <li>When they sign up using your code, they get 20 points.</li>
                        <li>You get 50 points for every successful referral!</li>
                        <li>Earn 1 point for every $10 spent on shopping.</li>
                        <li>Redeem points at checkout for instant discounts!</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Referral;

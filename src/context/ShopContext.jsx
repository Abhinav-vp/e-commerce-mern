import React, { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000";

const ShopContextProvider = (props) => {
    const [all_product, setAllProduct] = useState([]);
    const [cartItems, setCartItems] = useState({});

    // Fetch all products on mount
    useEffect(() => {
        fetch(`${API_BASE}/api/products`)
            .then((res) => res.json())
            .then((data) => setAllProduct(data))
            .catch((err) => console.error("Failed to fetch products:", err));

        // If user is logged in, fetch their cart
        const token = localStorage.getItem("auth-token");
        if (token) {
            fetch(`${API_BASE}/api/cart`, {
                headers: { "auth-token": token },
            })
                .then((res) => res.json())
                .then((data) => setCartItems(data))
                .catch((err) => console.error("Failed to fetch cart:", err));
        }
    }, []);

    const addToCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
        const token = localStorage.getItem("auth-token");
        if (token) {
            fetch(`${API_BASE}/api/cart/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token,
                },
                body: JSON.stringify({ itemId }),
            }).catch((err) => console.error("Failed to add to cart:", err));
        }
    };

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
        const token = localStorage.getItem("auth-token");
        if (token) {
            fetch(`${API_BASE}/api/cart/remove`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token,
                },
                body: JSON.stringify({ itemId }),
            }).catch((err) => console.error("Failed to remove from cart:", err));
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = all_product.find(
                    (product) => product.id === Number(item)
                );
                if (itemInfo) {
                    totalAmount += itemInfo.new_price * cartItems[item];
                }
            }
        }
        return totalAmount;
    };

    const getTotalCartItems = () => {
        let totalItem = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                totalItem += cartItems[item];
            }
        }
        return totalItem;
    };

    const contextValue = {
        getTotalCartItems,
        getTotalCartAmount,
        all_product,
        cartItems,
        addToCart,
        removeFromCart,
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;

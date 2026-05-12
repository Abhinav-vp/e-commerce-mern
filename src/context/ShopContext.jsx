import React, { createContext, useEffect, useState } from "react";
import all_product_data from "../components/Assets/Frontend_Assets/all_product";

export const ShopContext = createContext(null);

export const API_BASE = process.env.REACT_APP_API_BASE || (window.location.hostname === "localhost" ? "http://localhost:7000" : "");

const ShopContextProvider = (props) => {
    const [all_product, setAllProduct] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [promoCode, setPromoCode] = useState(null);
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [wishlistItems, setWishlistItems] = useState([]);

    // Fetch all products on mount
    useEffect(() => {
        fetch(`${API_BASE}/api/products`, { signal: AbortSignal.timeout(3000) })
            .then((res) => res.json())
            .then((data) => {
                const normalized = data.map((product) => ({
                    ...product,
                    image: product.image
                        ? product.image.startsWith("http")
                            ? product.image
                            : `${API_BASE}${product.image}`
                        : product.image,
                    thumbnail: (product.thumbnail && !product.thumbnail.includes("undefined"))
                        ? product.thumbnail.startsWith("http")
                            ? product.thumbnail
                            : `${API_BASE}${product.thumbnail}`
                        : undefined,
                    sub_images: (product.sub_images || []).map(url =>
                        url ? (url.startsWith("http") ? url : `${API_BASE}${url}`) : url
                    ),
                    sub_thumbnails: (product.sub_thumbnails || []).map(url =>
                        url ? (url.startsWith("http") ? url : `${API_BASE}${url}`) : url
                    ),
                }));
                setAllProduct(normalized);
            })
            .catch((err) => {
                console.warn("API unavailable, using local data:", err.message);
                setAllProduct(all_product_data);
            });

        // If user is logged in, fetch their cart
        const token = localStorage.getItem("auth-token");
        if (token) {
            fetch(`${API_BASE}/api/cart`, {
                headers: { "auth-token": token },
                signal: AbortSignal.timeout(3000)
            })
                .then((res) => res.json())
                .then((data) => setCartItems(data))
                .catch((err) => console.error("Failed to fetch cart:", err));

            fetch(`${API_BASE}/api/wishlist`, {
                headers: { "auth-token": token },
                signal: AbortSignal.timeout(3000)
            })
                .then((res) => res.json())
                .then((data) => setWishlistItems(Array.isArray(data) ? data : []))
                .catch((err) => console.error("Failed to fetch wishlist:", err));
        }
    }, []);

    const addToCart = (itemId, size, quantity = 1) => {
        const cartKey = size ? `${itemId}_${size}` : itemId;
        setCartItems((prev) => ({ ...prev, [cartKey]: (prev[cartKey] || 0) + quantity }));
        const token = localStorage.getItem("auth-token");
        if (token) {
            fetch(`${API_BASE}/api/cart/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token,
                },
                body: JSON.stringify({ itemId, size, quantity }),
            }).catch((err) => console.error("Failed to add to cart:", err));
        }
    };

    const removeFromCart = (itemId, size) => {
        const cartKey = size ? `${itemId}_${size}` : itemId;
        setCartItems((prev) => {
            const updated = { ...prev, [cartKey]: prev[cartKey] - 1 };
            if (updated[cartKey] <= 0) delete updated[cartKey];
            return updated;
        });
        const token = localStorage.getItem("auth-token");
        if (token) {
            fetch(`${API_BASE}/api/cart/remove`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token,
                },
                body: JSON.stringify({ itemId, size }),
            }).catch((err) => console.error("Failed to remove from cart:", err));
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const key in cartItems) {
            if (cartItems[key] > 0) {
                const itemId = key.includes('_') ? key.split('_')[0] : key;
                const itemInfo = all_product.find(
                    (product) => product.id === Number(itemId)
                );
                if (itemInfo) {
                    totalAmount += itemInfo.new_price * cartItems[key];
                }
            }
        }
        return totalAmount;
    };

    const getTotalCartItems = () => {
        let totalItem = 0;
        for (const key in cartItems) {
            if (cartItems[key] > 0) {
                totalItem += cartItems[key];
            }
        }
        return totalItem;
    };

    const applyPromo = (code, discount) => {
        setPromoCode(code);
        setPromoDiscount(discount);
    };

    const clearPromo = () => {
        setPromoCode(null);
        setPromoDiscount(0);
    };

    const toggleWishlist = (itemId) => {
        const token = localStorage.getItem("auth-token");
        if (!token) return;

        setWishlistItems((prev) => 
            prev.includes(Number(itemId)) 
                ? prev.filter(id => id !== Number(itemId)) 
                : [...prev, Number(itemId)]
        );

        fetch(`${API_BASE}/api/wishlist/toggle`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "auth-token": token,
            },
            body: JSON.stringify({ itemId }),
        }).catch((err) => console.error("Failed to toggle wishlist:", err));
    };

    const isInWishlist = (itemId) => {
        return wishlistItems.includes(Number(itemId));
    };

    const contextValue = {
        getTotalCartItems,
        getTotalCartAmount,
        all_product,
        cartItems,
        addToCart,
        removeFromCart,
        promoCode,
        promoDiscount,
        applyPromo,
        clearPromo,
        wishlistItems,
        toggleWishlist,
        isInWishlist,
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;

import React, { useEffect, useState } from 'react'
import './Popular.css'
import Item from '../Items/Item'
import all_product from '../Assets/Frontend_Assets/all_product'

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:7000";

const Popular = () => {
  const [popularProducts, setPopularProducts] = useState([]);

  useEffect(() => {
    // Try to fetch from API first
    fetch(`${API_BASE}/api/products/popular`, { signal: AbortSignal.timeout(3000) })
      .then((res) => res.json())
      .then((data) => {
        const normalized = data.map((product) => ({
          ...product,
          image: product.image
            ? product.image.startsWith("http")
              ? product.image
              : `${API_BASE}${product.image}`
            : product.image,
        }));
        setPopularProducts(normalized);
      })
      .catch((err) => {
        // Fallback to local data if API fails
        console.warn("API unavailable, using local data:", err.message);
        setPopularProducts(all_product.filter(p => p.category === 'women').slice(0, 4));
      });
  }, []);

  return (
    <div className='popular'>
      <h1>POPULAR IN WOMEN</h1>
      <hr />
      <div className="popular-item">
        {popularProducts.map((item, i) => {
          return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
        })}
      </div>
    </div>
  )
}

export default Popular

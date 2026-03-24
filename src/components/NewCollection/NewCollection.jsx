import React, { useEffect, useState } from 'react'
import './NewCollection.css'
import Item from '../Items/Item'
import all_product from '../Assets/Frontend_Assets/all_product'

const API_BASE = process.env.REACT_APP_API_BASE || `http://${window.location.hostname}:7000`;

const NewCollection = () => {
  const [newCollections, setNewCollections] = useState([]);

  useEffect(() => {
    // Try to fetch from API first
    fetch(`${API_BASE}/api/products/newcollections`, { signal: AbortSignal.timeout(3000) })
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
        setNewCollections(normalized);
      })
      .catch((err) => {
        // Fallback to local data if API fails
        console.warn("API unavailable, using local data:", err.message);
        setNewCollections(all_product.slice(-8));
      });
  }, []);

  return (
    <div className='new-collections'>
      <h1>NEW COLLECTION</h1>
      <hr />
      <div className="collections">
        {newCollections.map((item, i) => {
          return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
        })}
      </div>
    </div>
  )
}

export default NewCollection

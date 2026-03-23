import React, { useEffect, useState } from 'react'
import './NewCollection.css'
import Item from '../Items/Item'

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000";

const NewCollection = () => {
  const [newCollections, setNewCollections] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/products/newcollections`)
      .then((res) => res.json())
      .then((data) => setNewCollections(data))
      .catch((err) => console.error("Failed to fetch new collections:", err));
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

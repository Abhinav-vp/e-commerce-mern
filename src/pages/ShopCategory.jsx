import React, { useContext, useState, useEffect, useRef } from 'react'
import './CSS/ShopCategory.css'
import { ShopContext } from '../context/ShopContext'
import dropdown_icon from '../components/Assets/Frontend_Assets/dropdown_icon.png'
import Item from '../components/Items/Item'

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'price_low_high', label: 'Price: Low to High' },
  { value: 'price_high_low', label: 'Price: High to Low' },
];

const ShopCategory = (props) => {
  const { all_product } = useContext(ShopContext);

  const [visibleCount, setVisibleCount] = useState(8);
  const [sortOption, setSortOption] = useState('default');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = all_product.filter(
    (item) => props.category === item.category
  );

  // Sort the filtered products based on the selected option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === 'price_low_high') return a.new_price - b.new_price;
    if (sortOption === 'price_high_low') return b.new_price - a.new_price;
    return 0; // default — keep original order
  });

  const totalProducts = filteredProducts.length;
  const currentLabel = SORT_OPTIONS.find((o) => o.value === sortOption)?.label;

  return (
    <div className='shop-category'>
      <img className='shopcategory-banner' src={props.banner} alt="" />

      <div className="shopcategory-indexSort">
        <p>
          <span>Showing 1-{Math.min(visibleCount, totalProducts)}</span> out of {totalProducts} products
        </p>

        <div className="shopcategory-sort-wrapper" ref={sortRef}>
          <div
            className={`shopcategory-Sort ${sortOpen ? 'active' : ''}`}
            onClick={() => setSortOpen((prev) => !prev)}
            id="sort-toggle-btn"
          >
            <span className="sort-label">{currentLabel}</span>
            <img
              src={dropdown_icon}
              alt="sort"
              className={`sort-arrow ${sortOpen ? 'rotated' : ''}`}
            />
          </div>

          {sortOpen && (
            <ul className="sort-dropdown" id="sort-dropdown-menu">
              {SORT_OPTIONS.map((opt) => (
                <li
                  key={opt.value}
                  className={`sort-dropdown-item ${sortOption === opt.value ? 'selected' : ''}`}
                  onClick={() => {
                    setSortOption(opt.value);
                    setSortOpen(false);
                  }}
                  id={`sort-option-${opt.value}`}
                >
                  {sortOption === opt.value && <span className="sort-check">✓</span>}
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="shopcategory-products">
        {sortedProducts
          .slice(0, visibleCount)
          .map((item, i) => (
            <Item
              key={item.id}
              id={item.id}
              name={item.name}
              image={item.image}
              thumbnail={item.thumbnail}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))}
      </div>

      {visibleCount < totalProducts && (
        <div className="shopcategory-loadmore">
          <button onClick={() => setVisibleCount(totalProducts)}>
            Explore More
          </button>
        </div>
      )}
    </div>
  )
}

export default ShopCategory
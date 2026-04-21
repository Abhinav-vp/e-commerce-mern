import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { useModal } from '../../context/ModalContext';
import { API_BASE, ShopContext } from '../../context/ShopContext';
import star_icon from '../Assets/Frontend_Assets/star_icon.png';
import star_dull_icon from '../Assets/Frontend_Assets/star_dull_icon.png';
import './Reviews.css';

const Reviews = ({ productId }) => {
  const { showModal } = useModal();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/reviews/${productId}`);
      if (response.data.success) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('auth-token');
    
    if (!token) {
      showModal({ 
        title: 'Authentication Required', 
        message: 'Please login to submit a review.',
        onConfirm: () => window.location.replace('/login')
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(
        `${API_BASE}/api/reviews/add`,
        { productId: Number(productId), rating, comment },
        { headers: { 'auth-token': token } }
      );

      if (response.data.success) {
        showModal({ title: 'Success', message: 'Review submitted successfully!' });
        setComment('');
        setRating(5);
        fetchReviews();
      }
    } catch (error) {
      console.error('Error adding review:', error);
      showModal({ title: 'Error', message: error.response?.data?.message || 'Failed to submit review' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count) => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <img 
                key={i} 
                src={i <= count ? star_icon : star_dull_icon} 
                alt="" 
                className="star-icon"
            />
        );
    }
    return stars;
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="product-reviews">
      <div className="reviews-header">
        <h2>Customer Reviews</h2>
        {reviews.length > 0 && (
          <div className="average-rating">
            <span className="rating-num">{averageRating}</span>
            <div className="stars">{renderStars(Math.round(averageRating))}</div>
            <span className="count">({reviews.length} reviews)</span>
          </div>
        )}
      </div>

      <div className="reviews-container">
        <div className="reviews-list">
          {loading ? (
            <div className="loading">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="review-item">
                <div className="review-meta">
                  <span className="reviewer-name">{review.name}</span>
                  <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                </div>
                <div className="review-rating">{renderStars(review.rating)}</div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))
          )}
        </div>

        <div className="review-form-container">
          <h3>Write a Review</h3>
          <form onSubmit={handleSubmit} className="review-form">
            <div className="form-group">
              <label>Rating</label>
              <div className="star-picker">
                {[1, 2, 3, 4, 5].map((num) => (
                  <img 
                    key={num}
                    src={num <= rating ? star_icon : star_dull_icon}
                    alt={`${num} stars`}
                    onClick={() => setRating(num)}
                    className="picker-star"
                  />
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Your Feedback</label>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                required
                rows="4"
              ></textarea>
            </div>
            <button type="submit" disabled={submitting} className="submit-review-btn">
              {submitting ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Reviews;

import React, { useState } from 'react';

export const RatingStars = ({ rating = 0, max = 5, interactive = false, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const currentDisplay = hoverRating || rating;

  return (
    <div className={`rating-stars ${interactive ? 'interactive' : ''}`}>
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= currentDisplay;

        return (
          <i
            key={starValue}
            className={`bi ${isFilled ? 'bi-star-fill active' : 'bi-star'}`}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            role={interactive ? 'button' : 'img'}
            aria-label={`${starValue} star`}
          />
        );
      })}
    </div>
  );
};

export default RatingStars;

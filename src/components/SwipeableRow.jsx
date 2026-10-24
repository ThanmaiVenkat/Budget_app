import React, { useState, useRef } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

/**
 * Mobile-friendly touch swipe wrapper.
 * - Swipe right: triggers/reveals Edit
 * - Swipe left: triggers/reveals Delete
 */
export default function SwipeableRow({ children, onEdit, onDelete, canSwipe = true }) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isHorizontalSwipeRef = useRef(null);

  const handleTouchStart = (e) => {
    if (!canSwipe) return;
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
    isHorizontalSwipeRef.current = null;
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping || !canSwipe) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - startXRef.current;
    const diffY = touch.clientY - startYRef.current;

    // Detect if the user is scrolling vertically vs swiping horizontally
    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
        isHorizontalSwipeRef.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isHorizontalSwipeRef.current) {
      // Limit drag distance between -110px and +110px with slight resistance
      const clamped = Math.max(-110, Math.min(110, diffX));
      setDragOffset(clamped);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);

    if (dragOffset > 75 && onEdit) {
      onEdit();
    } else if (dragOffset < -75 && onDelete) {
      onDelete();
    }

    // Reset with smooth CSS transition
    setDragOffset(0);
    isHorizontalSwipeRef.current = null;
  };

  return (
    <div
      className="swipeable-wrapper"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Background Action: Edit on Right Swipe */}
      {dragOffset > 10 && (
        <div className="swipe-action-bg edit-bg">
          <Pencil size={15} />
          <span>{dragOffset > 70 ? 'Release to Edit' : 'Swipe to Edit'}</span>
        </div>
      )}

      {/* Background Action: Delete on Left Swipe */}
      {dragOffset < -10 && (
        <div className="swipe-action-bg delete-bg">
          <span>{dragOffset < -70 ? 'Release to Delete' : 'Swipe to Delete'}</span>
          <Trash2 size={15} />
        </div>
      )}

      {/* Main Foreground Content */}
      <div
        className="swipeable-content"
        style={{
          transform: `translateX(${dragOffset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.25s var(--ease-out)'
        }}
      >
        {children}
      </div>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import styles from './SlotColumn.module.css';

function SlotColumn({ items, finalIndex, isSpinning, onFinish }) {
  const columnRef = useRef(null);

  useEffect(() => {
    if (isSpinning) {
      const duration = 500; // duración ms
      const totalItems = items.length;
      const cycles = 3; // ciclos para repetir los íconos y dar efecto
      const itemHeight = 60;

      const finalOffset = (totalItems * cycles + finalIndex) * itemHeight;
      const el = columnRef.current;

      el.style.transition = `transform ${duration}ms ease-in-out`;
      el.style.transform = `translateY(-${finalOffset}px)`;

      const timer = setTimeout(() => {
        el.style.transition = 'none';
        el.style.transform = `translateY(-${finalIndex * itemHeight}px)`;
        onFinish();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isSpinning, finalIndex, items.length, onFinish]);

  return (
    <div className={styles.slotcolumn}>
      <div className={styles.slotinner} ref={columnRef}>
        {Array.from({ length: 5 }).flatMap((_, cycleIndex) =>
          items.map((item, index) => (
            <div key={`${cycleIndex}-${index}`} className={styles.slotitem}>
              {item.icon}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SlotColumn;
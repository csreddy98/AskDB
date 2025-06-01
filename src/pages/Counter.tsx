import React from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { increment, decrement, incrementByAmount } from '../store/counterSlice';

const Counter: React.FC = () => {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  const resetCounter = () => {
    // Reset by setting to 0
    dispatch(incrementByAmount(-count));
  };

  return (
    <div className="page">
      <h1>Redux Counter with Persistence</h1>
      <div className="counter-container">
        <div className="counter-display">
          <h2>Count: {count}</h2>
        </div>
        <div className="counter-controls">
          <button onClick={() => dispatch(increment())}>
            Increment
          </button>
          <button onClick={() => dispatch(decrement())}>
            Decrement
          </button>
          <button onClick={() => dispatch(incrementByAmount(5))}>
            +5
          </button>
          <button onClick={resetCounter} className="reset-btn">
            Reset
          </button>
        </div>
      </div>
      <div className="persistence-info">
        <p>This counter value persists across browser refreshes and sessions!</p>
        <p>Try changing the value and refreshing the page - your state will be preserved.</p>
      </div>
    </div>
  );
};

export default Counter;
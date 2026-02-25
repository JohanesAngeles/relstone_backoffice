import { useReducer, useEffect } from 'react';
import { CartContext } from './CartContext';

const STORAGE_KEY = 'relstone_cart';

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find(item => item.id === action.payload.id);
      if (existing) {
        return state.map(item =>
          item.id === action.payload.id
            ? { ...item, withTextbook: action.payload.withTextbook }
            : item
        );
      }
      return [...state, action.payload];
    }
    case 'REMOVE_ITEM':
      return state.filter(item => item.id !== action.payload.id);
    case 'TOGGLE_TEXTBOOK':
      return state.map(item =>
        item.id === action.payload.id
          ? { ...item, withTextbook: !item.withTextbook }
          : item
      );
    case 'CLEAR_CART':
      return [];
    case 'LOAD_CART':
      return action.payload;
    default:
      return state;
  }
};

const CartProvider = ({ children }) => {
  const [cartItems, dispatch] = useReducer(cartReducer, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: 'LOAD_CART', payload: parsed });
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart      = (item) => dispatch({ type: 'ADD_ITEM',        payload: item });
  const removeFromCart = (id)   => dispatch({ type: 'REMOVE_ITEM',     payload: { id } });
  const toggleTextbook = (id)   => dispatch({ type: 'TOGGLE_TEXTBOOK', payload: { id } });
  const clearCart      = ()     => dispatch({ type: 'CLEAR_CART' });
  const isInCart       = (id)   => cartItems.some(item => item.id === id);

  const cartCount        = cartItems.length;
  const cartTotal        = cartItems.reduce((sum, item) => sum + item.price + (item.withTextbook ? (item.textbookPrice || 0) : 0), 0);
  const totalCreditHours = cartItems.reduce((sum, item) => sum + (item.creditHours || 0), 0);

  return (
    <CartContext.Provider value={{
      cartItems, cartCount, cartTotal, totalCreditHours,
      addToCart, removeFromCart, toggleTextbook, clearCart, isInCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
/**
 * Shopping Cart Management System
 * Real-time cart operations with localStorage persistence
 */

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  sellerId: string;
  sellerName: string;
  category: string;
  location: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  updatedAt: Date;
}

const CART_STORAGE_KEY = 'azmera_cart';

/**
 * Get current cart
 */
export function getCart(): Cart {
  if (typeof window === 'undefined') {
    return { items: [], totalItems: 0, totalAmount: 0, updatedAt: new Date() };
  }

  const cartData = localStorage.getItem(CART_STORAGE_KEY);
  if (!cartData) {
    return { items: [], totalItems: 0, totalAmount: 0, updatedAt: new Date() };
  }

  const cart = JSON.parse(cartData);
  return {
    ...cart,
    updatedAt: new Date(cart.updatedAt),
  };
}

/**
 * Save cart to storage
 */
function saveCart(cart: Cart): void {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  
  // Dispatch custom event for cart updates
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
}

/**
 * Calculate cart totals
 */
function calculateTotals(items: CartItem[]): { totalItems: number; totalAmount: number } {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return { totalItems, totalAmount };
}

/**
 * Add item to cart
 */
export function addToCart(item: Omit<CartItem, 'id' | 'quantity'>): Cart {
  const cart = getCart();
  
  // Check if item already exists
  const existingItemIndex = cart.items.findIndex(i => i.productId === item.productId);
  
  if (existingItemIndex >= 0) {
    // Increase quantity
    cart.items[existingItemIndex].quantity += 1;
  } else {
    // Add new item
    const newItem: CartItem = {
      ...item,
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      quantity: 1,
    };
    cart.items.push(newItem);
  }
  
  const totals = calculateTotals(cart.items);
  const updatedCart: Cart = {
    items: cart.items,
    ...totals,
    updatedAt: new Date(),
  };
  
  saveCart(updatedCart);
  return updatedCart;
}

/**
 * Remove item from cart
 */
export function removeFromCart(itemId: string): Cart {
  const cart = getCart();
  cart.items = cart.items.filter(item => item.id !== itemId);
  
  const totals = calculateTotals(cart.items);
  const updatedCart: Cart = {
    items: cart.items,
    ...totals,
    updatedAt: new Date(),
  };
  
  saveCart(updatedCart);
  return updatedCart;
}

/**
 * Update item quantity
 */
export function updateQuantity(itemId: string, quantity: number): Cart {
  const cart = getCart();
  const itemIndex = cart.items.findIndex(item => item.id === itemId);
  
  if (itemIndex >= 0) {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }
    cart.items[itemIndex].quantity = quantity;
  }
  
  const totals = calculateTotals(cart.items);
  const updatedCart: Cart = {
    items: cart.items,
    ...totals,
    updatedAt: new Date(),
  };
  
  saveCart(updatedCart);
  return updatedCart;
}

/**
 * Clear entire cart
 */
export function clearCart(): Cart {
  const emptyCart: Cart = {
    items: [],
    totalItems: 0,
    totalAmount: 0,
    updatedAt: new Date(),
  };
  
  saveCart(emptyCart);
  return emptyCart;
}

/**
 * Get cart item count
 */
export function getCartItemCount(): number {
  const cart = getCart();
  return cart.totalItems;
}

/**
 * Check if product is in cart
 */
export function isInCart(productId: string): boolean {
  const cart = getCart();
  return cart.items.some(item => item.productId === productId);
}

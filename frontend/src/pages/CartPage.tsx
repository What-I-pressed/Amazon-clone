import React, { useState } from 'react';
import { X, Minus, Plus, Search, Info } from 'lucide-react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <tr className="border-b border-gray-200">
      <td className="py-6 px-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onRemove(item.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
          <img 
            src={item.image} 
            alt={item.name}
            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
          />
          <span className="text-gray-800 text-base font-medium">{item.name}</span>
        </div>
      </td>
      <td className="py-6 px-6 text-gray-800 text-base font-medium">${item.price}</td>
      <td className="py-6 px-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center text-base font-medium">{item.quantity}</span>
          <button 
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </td>
      <td className="py-6 px-6 text-gray-800 text-base font-semibold">
        ${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  );
};

const ProductCard = ({ 
  image, 
  discount, 
  title, 
  originalPrice, 
  salePrice, 
  onAddToCart,
  onInfo 
}) => {
  return (
    <div className="flex-shrink-0 w-56 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      {/* Product Image Container */}
      <div className="relative w-full h-56 bg-gray-50 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Discount Badge */}
        {discount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
            -{discount}%
          </div>
        )}
      </div>
      
      {/* Product Details */}
      <div className="p-4">
        {/* Product Title */}
        <h3 className="text-gray-800 text-base font-semibold mb-3 text-center">
          {title}
        </h3>
        
        {/* Price Section */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 text-base">
            {originalPrice && (
              <span className="text-gray-400 line-through font-medium">
                ${originalPrice}
              </span>
            )}
            <span className="text-gray-800 font-bold text-lg">
              ${salePrice}
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-2">
          <button 
            onClick={onInfo}
            className="w-8 h-8 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Info size={14} className="text-gray-600" />
          </button>
          <button 
            onClick={onAddToCart}
            className="w-8 h-8 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Plus size={14} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ShoppingCartPage = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Blue Armchair",
      price: 220,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop&auto=format"
    },
    {
      id: 2,
      name: "Loft-Style Lamp",
      price: 140,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&auto=format"
    },
    {
      id: 3,
      name: "Green Chair",
      price: 320,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&h=100&fit=crop&auto=format"
    },
    {
      id: 4,
      name: "Modern Bookshelf",
      price: 450,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1562113530-57ba7cea77ac?w=100&h=100&fit=crop&auto=format"
    }
  ]);

  const recommendedProducts = [
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&auto=format",
      discount: null,
      title: "Blue Armchair",
      originalPrice: null,
      salePrice: "220.00"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&auto=format",
      discount: 15,
      title: "Loft-style Lamp",
      originalPrice: "180.00",
      salePrice: "140.00"
    },
    {
      id: 7,
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop&auto=format",
      discount: null,
      title: "Green Chair",
      originalPrice: "350.00",
      salePrice: "320.50"
    },
    {
      id: 8,
      image: "https://images.unsplash.com/photo-1562113530-57ba7cea77ac?w=400&h=400&fit=crop&auto=format",
      discount: null,
      title: "Modern Bookshelf",
      originalPrice: null,
      salePrice: "450.00"
    }
  ];

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const addToCart = (productId) => {
    console.log(`Added product ${productId} to cart`);
    // Add your cart logic here
  };

  const handleInfo = (productId) => {
    console.log(`Show info for product ${productId}`);
    // Add your info/details logic here
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal; // No discount applied

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header style={{backgroundColor: '#434343'}} className="text-white px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <div className="flex items-center gap-3">
              <select className="bg-gray-500 text-white px-3 py-2 rounded text-sm border-0 outline-none">
                <option>All</option>
              </select>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Nexora Search"
                  className="bg-gray-500 text-white placeholder-gray-300 px-4 py-2 pr-10 rounded text-sm w-80 border-0 outline-none"
                />
                <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-8 text-sm">
            <select className="bg-transparent text-white outline-none">
              <option>EN ▼</option>
            </select>
            <span className="hover:text-gray-300 cursor-pointer">Returns & Orders</span>
            <div className="text-right">
              <div className="text-gray-300">Hello, sign in</div>
              <div className="font-medium">Sayyad ▼</div>
            </div>
            <span className="hover:text-gray-300 cursor-pointer">Cart</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Shopping Cart Section */}
        <div className="flex gap-8 mb-12">
          {/* Cart Items Table */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr style={{backgroundColor: '#A6A6A6'}} className="text-white">
                    <th className="text-left py-4 px-6 font-semibold text-base">Product</th>
                    <th className="text-left py-4 px-6 font-semibold text-base">Price</th>
                    <th className="text-left py-4 px-6 font-semibold text-base">Quantity</th>
                    <th className="text-left py-4 px-6 font-semibold text-base">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {cartItems.map(item => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="w-80">
            <div style={{backgroundColor: '#A6A6A6'}} className="text-white px-6 py-4 rounded-t-lg">
              <h3 className="font-semibold text-base">Cart Total</h3>
            </div>
            <div className="bg-white border-l border-r border-b border-gray-200 rounded-b-lg p-6 space-y-4">
              <div className="flex justify-between text-base">
                <span className="text-gray-700">SUBTOTAL</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-700">DISCOUNT</span>
                <span className="text-gray-500">—</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between font-bold text-lg">
                <span className="text-gray-800">TOTAL</span>
                <span className="text-gray-800">${total.toFixed(2)}</span>
              </div>
              <button className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors">
                Proceed To Checkout
              </button>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        <div className="bg-white py-8 px-8 rounded-lg shadow-sm border border-gray-200">
          <div className="mb-8">
            <h2 className="text-gray-800 text-xl font-bold">
              You May Also Like
            </h2>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-4">
            {recommendedProducts.map((product) => (
              <ProductCard
                key={product.id}
                image={product.image}
                discount={product.discount}
                title={product.title}
                originalPrice={product.originalPrice}
                salePrice={product.salePrice}
                onAddToCart={() => addToCart(product.id)}
                onInfo={() => handleInfo(product.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartPage;

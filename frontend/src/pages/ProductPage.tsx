import { useState } from 'react';
import { PlusIcon, ArrowRightIcon, ChevronLeftIcon, GroupIcon, AngleDownIcon } from '../icons';

const ProductPage = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("reviews");
  const [userRating, setUserRating] = useState(0);
  const [cartItems, setCartItems] = useState<Record<number, number>>({});
  const [email, setEmail] = useState('nexora@email.com');

  const productImages = [
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=600&fit=crop",
    "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&h=600&fit=crop",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&h=600&fit=crop"
  ];

  const thumbnails = [
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=250&fit=crop",
    "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=200&h=250&fit=crop",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=250&fit=crop"
  ];

  const similarProducts = [
    {
      id: 1,
      name: "Blue Armchair",
      price: 220.00,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center"
    },
    {
      id: 2,
      name: "Loft-style Lamp",
      originalPrice: 160.00,
      price: 140.00,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center"
    },
    {
      id: 3,
      name: "Green Chair",
      price: 320.50,
      image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop&crop=center"
    },
    {
      id: 4,
      name: "Modern Bookshelf",
      price: 460.00,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center"
    }
  ];

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = (productId: number) => {
    setCartItems(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const handleSubscribe = () => {
    console.log('Subscribing email:', email);
  };

  const StarRating = ({ rating = 4, total = 5, interactive = false, size = "w-4 h-4" }) => {
    const handleClick = (index: number) => {
      if (interactive) {
        setUserRating(index + 1);
      }
    };

    return (
      <div className="flex items-center gap-1">
        {[...Array(total)].map((_, i) => (
          <svg
            key={i}
            className={`${size} ${interactive ? 'cursor-pointer' : ''} ${
              i < (interactive ? userRating : rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
            onClick={() => handleClick(i)}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10 13.347l-2.987 2.134c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.38 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const TabsReviews = () => {
    return (
      <div className="bg-gray-50 p-6 rounded-md">
        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-2 text-gray-600 font-medium ${
              activeTab === "description" ? "border-b-2 border-black text-black" : ""
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-2 text-gray-600 font-medium ${
              activeTab === "reviews" ? "border-b-2 border-black text-black" : ""
            }`}
          >
            Reviews
          </button>
        </div>

        {/* Content */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            {/* One Review */}
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm text-gray-800">Jordan Barret</p>
                  <p className="text-gray-600 text-sm mt-1">
                    This set exceeded my expectations. It's sturdy, stylish, and fits perfectly in my room. The drawers on the side tables slide smoothly and offer great storage. Great value for the price!
                  </p>
                  <div className="flex space-x-4 text-xs text-gray-500 mt-2">
                    <button className="hover:underline">Like</button>
                    <button className="hover:underline">Reply</button>
                    <span>5m</span>
                  </div>
                </div>
                <div className="flex space-x-1 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10 13.347l-2.987 2.134c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.38 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Reviews */}
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm text-gray-800">Sarah Mitchell</p>
                  <p className="text-gray-600 text-sm mt-1">
                    Beautiful craftsmanship and excellent quality. The bookshelf is exactly as described and looks amazing in my living room. Assembly was straightforward too.
                  </p>
                  <div className="flex space-x-4 text-xs text-gray-500 mt-2">
                    <button className="hover:underline">Like</button>
                    <button className="hover:underline">Reply</button>
                    <span>2h</span>
                  </div>
                </div>
                <div className="flex space-x-1 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill={i < 4 ? "currentColor" : "none"}
                      stroke={i < 4 ? "none" : "currentColor"}
                      className="w-4 h-4"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10 13.347l-2.987 2.134c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.38 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            {/* Review Form */}
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Your Name:</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring focus:ring-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Your Email:</label>
                    <input
                      type="email"
                      placeholder="person@gmail.com"
                      className="w-full px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring focus:ring-gray-200"
                    />
                  </div>
                </div>
                <div>
                  <textarea
                    placeholder="Write your review..."
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring focus:ring-gray-200"
                    rows={3}
                  ></textarea>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <span>Your Ratings:</span>
                    <StarRating interactive={true} size="w-5 h-5" />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition"
                  >
                    Post Review →
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "description" && (
          <div className="bg-white p-6 rounded-md border border-gray-200">
            <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Product Description</h3>
              <p>Upgrade your bedroom with this elegant double bed and matching side tables. Crafted from high-quality wood with a modern design, it combines comfort and style to enhance your living space. The set includes a durable frame, a supportive headboard, and two side tables with storage drawers—perfect for keeping essentials within reach.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Features:</h4>
                  <ul className="space-y-1">
                    <li>• Sturdy wooden construction with sleek finish</li>
                    <li>• Includes two side tables with built-in drawers</li>
                    <li>• Ideal for modern or contemporary bedroom decor</li>
                    <li>• Easy assembly with included hardware</li>
                    <li>• Sustainable materials and eco-friendly finish</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Specifications:</h4>
                  <ul className="space-y-1">
                    <li>• Material: High-quality engineered wood</li>
                    <li>• Dimensions: 180cm x 200cm x 90cm</li>
                    <li>• Weight capacity: Up to 300kg</li>
                    <li>• Finish: Matte lacquer coating</li>
                    <li>• Assembly time: 45-60 minutes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const SimilarProducts = () => {
    return (
      <div className="w-full max-w-7xl mx-auto p-8 bg-white">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Similar Products</h2>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {similarProducts.map((product) => (
            <div key={product.id} className="flex flex-col group w-64">
              {/* Product Image Container */}
              <div className="relative mb-4">
                <div className="w-full h-72 bg-gray-50 rounded-2xl overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Discount Badge - only show if there's an original price */}
                  {product.originalPrice && (
                    <div className="absolute top-4 left-4">
                      <div className="bg-gray-800 text-white px-2 py-1 rounded-md text-xs font-medium">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="flex-1 flex flex-col">
                {/* Product Name */}
                <h3 className="text-gray-800 font-medium text-base mb-3 leading-tight">
                  {product.name}
                </h3>

                {/* Price and Add Button Row */}
                <div className="flex items-center justify-between mt-auto">
                  {/* Price Container */}
                  <div className="flex items-center gap-2">
                    {/* Show original price if it exists */}
                    {product.originalPrice && (
                      <span className="text-gray-400 text-sm line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                    
                    {/* Current Price */}
                    <span className="text-gray-900 font-semibold text-lg">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <PlusIcon className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
                
                {/* Cart Count Display */}
                {cartItems[product.id] > 0 && (
                  <div className="mt-2 text-xs text-green-600 font-medium">
                    Added: {cartItems[product.id]} item{cartItems[product.id] > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-pink-400 rounded-full transition-all duration-300 hover:scale-125 cursor-pointer"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full transition-all duration-300 hover:scale-125 cursor-pointer"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full transition-all duration-300 hover:scale-125 cursor-pointer"></div>
          </div>
        </div>
      </div>
    );
  };

  const NexoraFooter = () => {
    return (
      <footer className="text-white" style={{backgroundColor: '#3D3D3D', fontFamily: 'Poppins, sans-serif'}}>
        {/* Newsletter Section */}
        <div className="max-w-7xl mx-auto px-24 py-16">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-light text-gray-100 mb-10 leading-tight" style={{fontFamily: 'Afacad, sans-serif'}}>
              Subscribe To Your Newsletter<br />
              to Stay Updated About Discounts
            </h2>
            {/* Email Input */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="flex items-center bg-black bg-opacity-15 backdrop-blur-sm border border-white border-opacity-60 rounded-full px-5 py-4 w-80">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent text-gray-300 placeholder-gray-400 flex-1 outline-none text-base"
                    placeholder="nexora@email.com"
                  />
                  <button
                    onClick={handleSubscribe}
                    className="ml-3 bg-gray-700 hover:bg-gray-600 transition-colors rounded-full p-3"
                  >
                    <ChevronLeftIcon className="w-6 h-6 text-white transform rotate-90" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-4 gap-12 mb-20">
            {/* Products */}
            <div>
              <h3 className="text-gray-400 font-medium mb-8 text-lg">Products</h3>
              <ul className="space-y-6">
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors text-lg">For Home</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors text-lg">For Kitchen</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors text-lg">Electronics</a></li>
              </ul>
            </div>

            {/* Legal Pages */}
            <div>
              <h3 className="text-gray-400 font-medium mb-8 text-lg">Legal Pages</h3>
              <ul className="space-y-6">
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors text-lg">Privacy Policy</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors text-lg">Terms & Conditions</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors text-lg">Refund Policy</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors text-lg">Shipping Info</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors text-lg">Contact Us</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-gray-400 font-medium mb-8 text-lg">SUPPORT</h3>
              <ul className="space-y-6">
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors text-lg">FAQ</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors text-lg">Customer Service</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors text-lg">Order Tracking</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors text-lg">Returns & Exchanges</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors text-lg">Warranty</a></li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h3 className="text-gray-400 font-medium mb-8 text-lg">ABOUT</h3>
              <ul className="space-y-6">
                <li><a href="#" className="text-white hover:text-gray-300 transition-all duration-300 text-lg hover:translate-x-1">Our Story</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-all duration-300 text-lg hover:translate-x-1">Sustainability</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-all duration-300 text-lg hover:translate-x-1">Careers</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-all duration-300 text-lg hover:translate-x-1">Blog</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-all duration-300 text-lg hover:translate-x-1">Partnerships</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-600">
          <div className="max-w-7xl mx-auto px-24 py-6">
            <div className="text-center">
              <p className="text-white text-base">
                Copyright © 2025 Nexora, Inc
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Product Page Content */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-gray-500 mb-12">
          <span>Product Listing</span>
          <ChevronLeftIcon className="w-5 h-5" />
          <span className="text-gray-700 font-medium">Dummy Product Page</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Product Images */}
          <div className="lg:col-span-7">
            <div className="flex gap-8">
              {/* Thumbnails */}
              <div className="flex flex-col gap-8">
                {thumbnails.map((thumb, index) => (
                  <div
                    key={index}
                    className={`w-36 h-48 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                      selectedImage === index ? 'border-gray-300' : 'border-transparent hover:border-gray-200'
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={thumb}
                      alt={`Product view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-1">
                <div className="w-full h-[600px] rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={productImages[selectedImage]}
                    alt="Modern Bookshelf"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-5 space-y-8">
            {/* Title and Wishlist */}
            <div className="flex items-start justify-between">
              <h1 className="text-4xl font-light text-gray-800">Modern Bookshelf</h1>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="p-2 hover:bg-gray-50 rounded-full transition-colors"
              >
                <svg
                  className={`w-8 h-8 ${
                    isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>

            {/* Price and Rating */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-medium text-gray-800">$60</span>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="flex items-center gap-3">
                  <StarRating rating={4} />
                  <span className="text-gray-600">( 32 review )</span>
                </div>
              </div>
            </div>

            {/* Review Highlight */}
            <div className="border border-gray-300 rounded-2xl p-6 bg-gray-50">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
                    alt="Reviewer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">mebli_store</span>
                    <div className="flex items-center gap-1">
                      <StarRating rating={5} />
                    </div>
                  </div>
                  <button className="text-gray-700 hover:text-gray-900 flex items-center gap-2 text-sm font-medium">
                    See all reviews <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gray-200"></div>

            {/* Description */}
            <div className="text-gray-600 leading-relaxed">
              <p>Upgrade your bedroom with this elegant double bed and matching side tables. Crafted from high-quality wood with a modern design, it combines comfort and style to enhance your living space. The set includes a durable frame, a supportive headboard, and two side tables with storage drawers—perfect for keeping essentials within reach.</p>
              <br />
              <p>Sturdy wooden construction with sleek finish<br />
                Includes two side tables with built-in drawers<br />
                Ideal for modern or contemporary bedroom decor</p>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center border border-gray-300 rounded-full px-4 py-3 bg-white">
                  <button
                    onClick={decreaseQuantity}
                    className="p-2 hover:bg-gray-50 rounded-full transition-colors"
                  >
                    <AngleDownIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="mx-6 text-lg font-medium min-w-[20px] text-center">{quantity}</span>
                  <button
                    onClick={increaseQuantity}
                    className="p-2 hover:bg-gray-50 rounded-full transition-colors"
                  >
                    <PlusIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Add to Cart */}
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 px-8 rounded-full font-medium text-lg flex items-center justify-center gap-3 transition-colors">
                  Add to Cart <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Buy Now */}
              <button className="w-full border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white py-4 px-8 rounded-full font-medium text-lg transition-colors">
                Buy Now
              </button>
            </div>

            {/* Shipping Info */}
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-5">
                <GroupIcon className="w-7 h-7 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-800 font-medium">Free worldwide shipping on all orders over $100</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <svg className="w-7 h-7 text-gray-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
                <div>
                  <p className="text-gray-800 font-medium">Delivers in: 3-7 Working Days Shipping & Return</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          <TabsReviews />
        </div>
      </div>

      {/* Similar Products Section */}
      <SimilarProducts />

      {/* Footer */}
      <NexoraFooter />
    </div>
  );
};

export default ProductPage;
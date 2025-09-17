import React, { useRef, useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import ProductCard from './ProductCard';

const HomePage: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Reusable style objects
  const styles = {
    colors: {
      primary: 'rgb(85, 114, 106)',
      darkGray: 'rgb(37, 37, 37)',
      mediumGray: 'rgb(61, 61, 61)',
      lightGray: 'rgb(94, 94, 94)',
      textSecondary: 'rgb(102, 102, 102)',
      categoryText: 'rgb(24, 29, 37)',
      categorySubtext: 'rgb(54, 66, 84)',
      categoryBg: 'rgb(245, 247, 250)',
      searchBg: 'rgb(40, 40, 40)',
      textInput: 'rgb(50, 50, 50)',
      buttonHover: '#343434'
    },
    
    transitions: {
      fast: 'transition-all duration-200',
      normal: 'transition-all duration-300',
      slow: 'transition-transform duration-300'
    },
    
    hover: {
      scale: 'hover:scale-105',
      scaleSmall: 'hover:scale-110',
      shadow: 'hover:shadow-lg',
      shadowMd: 'hover:shadow-md',
      navButton: 'hover:bg-white/20 hover:scale-105',
      searchBar: 'hover:shadow-lg hover:bg-gray-200/80',
      categoryCard: 'group cursor-pointer',
      imageScale: 'group-hover:scale-105 transition-transform duration-300'
    },
    
    layout: {
      container: 'max-w-7xl mx-auto',
      section: 'w-full px-8 py-16',
      sectionLarge: 'w-full px-12 py-16',
      flexCenter: 'flex items-center justify-center',
      textCenter: 'text-center space-y-1'
    },
    
    typography: {
      mainTitle: 'font-afacad text-7xl font-bold leading-tight',
      subtitle: 'font-afacad text-4xl leading-tight -mt-2',
      sectionTitle: 'font-afacad text-4xl font-bold mb-3',
      categoryTitle: 'font-poppins font-semibold text-lg',
      cardTitle: 'text-white font-poppins',
      description: 'font-poppins text-lg leading-relaxed max-w-4xl mx-auto px-4',
      sectionDesc: 'font-poppins text-base leading-relaxed',
      categorySubtext: 'font-poppins text-sm'
    }
  };

  // Reusable component for navigation buttons
  const NavButton: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <button className={`flex items-center justify-center h-12 px-4 rounded-md cursor-pointer ${styles.transitions.fast} ${styles.hover.navButton}`}>
      <span className="text-white font-poppins text-base hover:text-gray-100">{children}</span>
    </button>
  );

  // Reusable component for category cards
  const CategoryCard: React.FC<{ imageUrl: string; title: string; items: string[] }> = ({ imageUrl, title, items }) => (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-41 h-41 rounded-full flex items-center justify-center overflow-hidden"
           style={{ backgroundColor: styles.colors.categoryBg }}>
        <img src={imageUrl} alt={title} className="max-w-full max-h-full object-contain object-center" />
      </div>
      <div className={styles.layout.textCenter}>
        <h3 className={styles.typography.categoryTitle} style={{ color: styles.colors.categoryText }}>
          {title}
        </h3>
        <div className="space-y-1">
          {items.map((item, idx) => (
            <p key={idx} className={styles.typography.categorySubtext} style={{ color: styles.colors.categorySubtext }}>
              {item}
            </p>
          ))}
        </div>
      </div>
    </div>
  );

  // Reusable component for featured cards
  const FeatureCard: React.FC<{ 
    imageUrl: string; 
    title: string; 
    className?: string;
    titleSize?: string;
  }> = ({ imageUrl, title, className = "h-60", titleSize = "text-xl" }) => (
    <div className={`relative rounded-2xl overflow-hidden group cursor-pointer ${className}`}>
      <img 
        src={imageUrl}
        alt={title}
        className={`w-full h-full object-cover brightness-75 ${styles.hover.imageScale}`}
      />
      <div className="absolute bottom-5 left-5 max-w-xs">
        <h3 className={`text-white font-poppins ${titleSize} leading-tight`}>
          {title}
        </h3>
      </div>
    </div>
  );

  // Navigation items data
  const navItems = ['All', 'Sell', 'Best Sellers', "Today's Deals", 'Customer Service', 'Electronics', 'Fashion', 'New Releases', 'Nexora Pay'];

  // Categories data
  const categories = [
    {
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      title: 'Furniture',
      items: ['Sofas & Chairs', 'Tables & Storage', 'Bedroom Sets']
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      title: 'Electronics',
      items: ['Smartphones', 'Laptops & PCs', 'Audio & TV']
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      title: 'Fashion',
      items: ["Men's Clothing", "Women's Wear", 'Accessories']
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      title: 'Home & Garden',
      items: ['Kitchen Tools', 'Garden & Patio', 'Home Decor']
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      title: 'Sports',
      items: ['Fitness Equipment', 'Outdoor Sports', 'Athletic Wear']
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      title: 'Books',
      items: ['Fiction & Literature', 'Educational', 'Self-Help']
    }
  ];

  // Featured cards data
  const featuredCardsGrid1 = [
    {
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Shop Fashion for less',
      className: 'lg:row-span-2 h-128',
      titleSize: 'text-2xl'
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Refresh your space'
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Fashion trends you like'
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Easy updates for elevated spaces',
      className: 'lg:row-span-2 h-128',
      titleSize: 'text-2xl'
    }
  ];

  const featuredCardsGrid2 = [
    {
      imageUrl: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Toys for all ages'
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Most-loved travel essentials'
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Level up your beauty routine',
      className: 'lg:row-span-2 h-128',
      titleSize: 'text-2xl'
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Most-loved watches'
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Deals on top categories'
    }
  ];

  const updateScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', updateScrollButtons);
      updateScrollButtons();
      return () => carousel.removeEventListener('scroll', updateScrollButtons);
    }
  }, []);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current && !isScrolling) {
      setIsScrolling(true);
      const scrollAmount = 320;
      const currentScroll = carouselRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? Math.max(0, currentScroll - scrollAmount)
        : currentScroll + scrollAmount;
      
      const carousel = carouselRef.current;
      carousel.style.transform = 'scale(0.99)';
      carousel.style.transition = 'transform 0.01s ease-out';
      
      carousel.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });

      setTimeout(() => {
        carousel.style.transform = 'scale(1)';
        carousel.style.transition = 'transform 0.2s ease-out';
        setIsScrolling(false);
        updateScrollButtons();
      }, 100);

      setTimeout(() => {
        carousel.style.transition = '';
      }, 300);
    }
  };

  const featuredProducts = [
    {
      id: 101,
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: 'Double Bed & Side Tables',
      oldPrice: '$230.00',
      price: '$200.00',
      discountPercent: '-13%',
    },
    {
      id: 102,
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: 'Modern Sofa Set',
      oldPrice: '$230.00',
      price: '$200.00',
      discountPercent: '-13%',
    },
    {
      id: 103,
      imageUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: 'Smart Home Device',
      oldPrice: '$230.00',
      price: '$200.00',
      discountPercent: '-13%',
    },
    {
      id: 104,
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: 'Garden Tools Set',
      oldPrice: '$230.00',
      price: '$200.00',
      discountPercent: '-13%',
    },
  ];

  const popularProducts = [
    {
      id: 201,
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: 'Double Bed & Side Tables',
      oldPrice: '$230.00',
      price: '$200.00',
      discountPercent: '-13%',
    },
    {
      id: 202,
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: 'Modern Sofa Set',
      oldPrice: '$450.00',
      price: '$360.00',
      discountPercent: '-20%',
    },
    {
      id: 203,
      imageUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: 'Dining Table Set',
      oldPrice: '$320.00',
      price: '$272.00',
      discountPercent: '-15%',
    },
    {
      id: 204,
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: 'Office Chair',
      oldPrice: '$180.00',
      price: '$162.00',
      discountPercent: '-10%',
    },
    {
      id: 205,
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: 'Coffee Table',
      oldPrice: '$200.00',
      price: '$150.00',
      discountPercent: '-25%',
    },
    {
      id: 206,
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: 'Bookshelf',
      oldPrice: '$280.00',
      price: '$230.00',
      discountPercent: '-18%',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Navigation Bar */}
      <div className={`w-full h-14 ${styles.layout.flexCenter}`} style={{ backgroundColor: styles.colors.primary }}>
        <div className="flex items-center gap-4 h-12">
          {navItems.map((item) => (
            <NavButton key={item}>{item}</NavButton>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative w-full px-8 py-20 flex flex-col items-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: "url('/images/background/mainpagebg.png')" }} 
        />

        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <h1 className={styles.typography.mainTitle} style={{ color: styles.colors.darkGray }}>
            Nexora Market
          </h1>
          <h3 className={styles.typography.subtitle} style={{ color: styles.colors.darkGray }}>
            Buy What's Next
          </h3>

          <p className={styles.typography.description} style={{ color: styles.colors.lightGray }}>
            Easily explore our wide collection of products with just a few clicks. Whether you're looking for the latest trends, everyday essentials, or unique finds, our smart search helps you get exactly what you need. Save time and shop smarter with a seamless browsing experience.
          </p>

          <div className="flex justify-center mt-8">
            <div className={`relative w-96 h-14 rounded-full border border-gray-300 backdrop-blur-md bg-gray-200/70 shadow-sm ${styles.transitions.normal} ${styles.hover.searchBar}`}>
              <input
                type="text"
                placeholder="Search An Item"
                className={`w-full h-full px-5 pr-16 bg-transparent text-base font-poppins placeholder-gray-600 focus:outline-none rounded-full hover:placeholder-gray-700 ${styles.transitions.fast}`}
                style={{ color: styles.colors.textInput }}
              />
              <button 
                className={`absolute right-2 top-2 w-10 h-10 rounded-full flex items-center justify-center ${styles.transitions.fast} ${styles.hover.scaleSmall} ${styles.hover.shadowMd}`}
                style={{ backgroundColor: styles.colors.searchBg }}
              >
                <Search className={`w-4 h-4 text-white hover:text-gray-100 ${styles.transitions.fast}`} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className={styles.layout.section}>
        <div className={styles.layout.container}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, idx) => (
              <CategoryCard key={idx} {...category} />
            ))}
          </div>
        </div>
      </div>

      {/* Featured Collections Section */}
      <div className={styles.layout.sectionLarge}>
        <div className={styles.layout.container}>
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className={styles.typography.sectionTitle} style={{ color: styles.colors.mediumGray }}>
              View Our Range Of Categories
            </h2>
            <p className={styles.typography.sectionDesc} style={{ color: styles.colors.textSecondary }}>
              Explore our diverse collection of products designed to suit every need. Whether you're looking for the latest tech, stylish fashion, or everyday essentials, we have something for everyone.
            </p>
          </div>

          {/* Featured Cards Grid 1 */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            <FeatureCard {...featuredCardsGrid1[0]} />
            <div className="space-y-8">
              <FeatureCard {...featuredCardsGrid1[1]} />
              <FeatureCard {...featuredCardsGrid1[2]} />
            </div>
            <FeatureCard {...featuredCardsGrid1[3]} />
          </div>

          {/* Featured Cards Grid 2 */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-8">
              <FeatureCard {...featuredCardsGrid2[0]} />
              <FeatureCard {...featuredCardsGrid2[1]} />
            </div>
            <FeatureCard {...featuredCardsGrid2[2]} />
            <div className="space-y-8">
              <FeatureCard {...featuredCardsGrid2[3]} />
              <FeatureCard {...featuredCardsGrid2[4]} />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className={styles.layout.sectionLarge}>
        <div className={styles.layout.container}>
          <div className="flex flex-col lg:flex-row lg:items-start gap-8 mb-12">
            <div className="lg:w-1/3">
              <h2 className="text-4xl font-bold mb-4 text-center lg:text-left" style={{ color: styles.colors.mediumGray }}>
                Featured Products
              </h2>
            </div>
            <div className="lg:w-2/3">
              <p className="text-base leading-relaxed text-center lg:text-left" style={{ color: styles.colors.textSecondary }}>
                Discover our hand-picked selection of best-selling items designed to make your life easier and more stylish. From innovative gadgets to everyday essentials, our featured products combine quality, functionality, and great value.
              </p>
            </div>
          </div>

          <div className="-mx-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-">
            {featuredProducts.map((p, idx) => (
              <ProductCard key={`featured-${idx}`} {...p} variant="grid" />
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="w-full py-60 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1920&q=80')",
            filter: 'brightness(0.7) contrast(0.1)'
          }}
        />
        
        <div className={`relative z-10 ${styles.layout.container} px-8`}>
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-6">
              <h2 className="text-5xl lg:text-5xl font-bold text-white leading-tight">
                Have a Look at Our Unique Selling Propositions
              </h2>
              <div className="flex items-center gap-3">
                <button className={`bg-[#282828] text-white font-semibold px-6 py-4 rounded-full flex items-center gap-3 ${styles.transitions.normal}`}
                        style={{ backgroundColor: '#282828' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.colors.buttonHover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#282828'}>
                  <span className="font-poppins text-lg">See Our Products</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="lg:w-1/2 space-y-8">
              <h3 className="text-xl text-white mb-8">
                Discover why customers choose us over the competition. We combine innovation, reliability, and customer satisfaction to deliver unmatched value.
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <div className="text-5xl font-bold text-white">99%</div>
                  <p className="text-white text-lg leading-relaxed">
                    Customer satisfaction rate, with thousands of happy clients worldwide.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-5xl font-bold text-white">100%</div>
                  <p className="text-white text-lg leading-relaxed">
                    Commitment to quality and sustainable sourcing in every product we offer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Products Carousel Section */}
      <div className="w-full py-16 bg-white">
        <div className={`${styles.layout.container} px-8`}>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-4" style={{ color: styles.colors.mediumGray }}>
                Popular products
              </h2>
              <p className="text-base leading-relaxed" style={{ color: styles.colors.textSecondary }}>
                Discover our most loved and best-selling products
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {[
                { direction: 'left' as const, canScroll: canScrollLeft, icon: "M15 19l-7-7 7-7" },
                { direction: 'right' as const, canScroll: canScrollRight, icon: "M9 5l7 7-7 7" }
              ].map(({ direction, canScroll, icon }) => (
                <button 
                  key={direction}
                  onClick={() => scrollCarousel(direction)}
                  disabled={!canScroll || isScrolling}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    canScroll && !isScrolling
                      ? 'border-gray-200 hover:border-gray-300 hover:bg-white cursor-pointer'
                      : 'border-gray-100 bg-white cursor-not-allowed opacity-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div ref={carouselRef} className="overflow-x-auto scrollbar-hide relative">
              <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
                {popularProducts.map((p, idx) => (
                  <div 
                    key={`popular-${idx}`}
                    className={`carousel-item transform transition-all duration-500 ${styles.hover.scale} ${styles.hover.shadow}`}
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <ProductCard {...p} variant="carousel" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default HomePage;

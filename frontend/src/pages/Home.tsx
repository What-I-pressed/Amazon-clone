import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import ProductCard from './ProductCard';
import { fetchProducts } from '../api/products';
import { fetchCategories, type CategorySummary } from '../api/categories';
import type { Product } from '../types/product';
import AOS from 'aos';

const CATEGORY_IMAGE_MATCHES = [
  {
    keywords: ['elect', 'tech', 'device', 'gadget'],
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['fashion', 'cloth', 'apparel', 'style'],
    url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['home', 'furn', 'decor', 'living'],
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['beaut', 'cosmetic', 'skincare', 'makeup'],
    url: 'https://images.unsplash.com/photo-1526045478516-99145907023c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['sport', 'fitness', 'outdoor', 'athlet'],
    url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['toy', 'kid', 'baby', 'play'],
    url: 'https://images.unsplash.com/photo-1511452885600-a2a6fcb7c1b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['book', 'literature', 'read', 'novel'],
    url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['grocery', 'food', 'kitchen', 'culinary'],
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
];

const FALLBACK_CATEGORY_IMAGES = [
  'https://images.unsplash.com/photo-1491557345352-5929e343eb89?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1470337458703-46ad1756a187?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1514996937319-344454492b37?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
];

const getCategoryImage = (categoryName: string, index: number) => {
  const lower = (categoryName || '').toLowerCase();
  const match = CATEGORY_IMAGE_MATCHES.find(({ keywords }) =>
    keywords.some(keyword => lower.includes(keyword))
  );
  if (match) {
    return match.url;
  }
  return FALLBACK_CATEGORY_IMAGES[index % FALLBACK_CATEGORY_IMAGES.length];
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [popularLoading, setPopularLoading] = useState<boolean>(false);
  const [popularError, setPopularError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);

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
  const CategoryCard: React.FC<{
    imageUrl: string;
    title: string;
    items: { id?: number; name: string }[];
    animationDelay?: number;
  }> = ({ imageUrl, title, items, animationDelay = 0 }) => (
    <button
      type="button"
      onClick={() => navigate(`/search?category=${encodeURIComponent(title)}`)}
      className="group flex flex-col items-center space-y-3 transition-transform duration-200 mt-4 hover:-translate-y-1 hover:scale-[1.01]"
      data-aos="zoom-in"
      data-aos-duration="600"
      data-aos-delay={animationDelay}
    >
      <div
        className="w-40 h-40 rounded-full flex items-center justify-center overflow-hidden bg-gray-50 transition-transform duration-200 group-hover:scale-[1.02]"
        style={{ backgroundColor: styles.colors.categoryBg }}
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
        />
      </div>
      <div className="w-full flex flex-col items-center space-y-1">
        <h3 className={`${styles.typography.categoryTitle} transition-colors duration-200 text-center`}
            style={{ color: styles.colors.categoryText }}>
          {title}
        </h3>
        <div className="w-full flex flex-col items-center space-y-1 text-sm">
          {items.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                if (item.id) {
                  navigate(`/search?subcategoryId=${item.id}`);
                } else {
                  navigate(`/search?subcategory=${encodeURIComponent(item.name)}`);
                }
              }}
              className="text-center w-full transition duration-200 rounded-full px-3 py-1 hover:bg-gray-100/40 hover:text-gray-900"
              style={{ color: styles.colors.categorySubtext }}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </button>
  );

  // Reusable component for featured cards
  const FeatureCard: React.FC<{ 
    imageUrl: string; 
    title: string; 
    className?: string;
    titleSize?: string;
    categoryName?: string;
    animationDelay?: number;
  }> = ({ imageUrl, title, className = "h-60", titleSize = "text-xl", categoryName, animationDelay = 0 }) => {
    const handleNavigate = () => {
      if (categoryName) {
        navigate(`/search?category=${encodeURIComponent(categoryName)}`);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!categoryName) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleNavigate();
      }
    };

    return (
      <div
        role={categoryName ? 'button' : undefined}
        tabIndex={categoryName ? 0 : -1}
        onClick={categoryName ? handleNavigate : undefined}
        onKeyDown={categoryName ? handleKeyDown : undefined}
        className={`relative rounded-2xl overflow-hidden group ${className} ${
          categoryName ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-transparent' : ''
        }`}
        data-aos="fade-up"
        data-aos-delay={animationDelay}
      >
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
  };

  // Navigation items data
  const navItems = ['All', 'Sell', 'Best Sellers', "Today's Deals", 'Customer Service', 'Electronics', 'Fashion', 'New Releases', 'Nexora Pay'];

  // Categories data
  const resolvedCategories = useMemo(() => {
    if (!categories.length) {
      return [];
    }

    return categories.slice(0, 6).map((category, idx) => {
      const subcategories = category.subcategories.slice(0, 3);
      const items = subcategories.map((sub) => ({ id: sub.id, name: sub.name }));

      return {
        imageUrl: getCategoryImage(category.name, idx),
        title: category.name,
        items,
      };
    });
  }, [categories]);

  useEffect(() => {
    let ignore = false;

    const loadCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const result = await fetchCategories();
        if (ignore) return;

        setCategories(result);
        if (!result.length) {
          setCategoriesError('No categories available yet.');
        }
      } catch (error) {
        if (!ignore) {
          setCategoriesError('Unable to load categories. Please try again later.');
        }
      } finally {
        if (!ignore) {
          setCategoriesLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      ignore = true;
    };
  }, []);

  // Featured cards data
  const featureCardBase = useMemo(
    () => [
      {
        imageUrl: 'https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?auto=format&fit=crop&w=800&q=80',
        fallbackTitle: 'Statement fashion picks',
        className: 'lg:row-span-2 h-128',
        titleSize: 'text-2xl'
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=800&q=80',
        fallbackTitle: 'Refresh your space'
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=800&q=80',
        fallbackTitle: 'Tech that inspires'
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
        fallbackTitle: 'Easy updates for elevated spaces',
        className: 'lg:row-span-2 h-128',
        titleSize: 'text-2xl'
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1503454510643-66c5ca1e1e3d?auto=format&fit=crop&w=800&q=80',
        fallbackTitle: 'Playtime essentials'
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
        fallbackTitle: 'Travel-ready finds'
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
        fallbackTitle: 'Beauty bestsellers',
        className: 'lg:row-span-2 h-128',
        titleSize: 'text-2xl'
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1518544889280-48c8e8e01e15?auto=format&fit=crop&w=800&q=80',
        fallbackTitle: 'Timeless accessories'
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=800&q=80',
        fallbackTitle: 'Top category deals'
      }
    ],
    []
  );

  const featuredCategoryCards = useMemo(() => {
    if (!categories.length) {
      return featureCardBase.map((card) => ({
        imageUrl: card.imageUrl,
        title: card.fallbackTitle,
        className: card.className,
        titleSize: card.titleSize,
        categoryName: undefined,
      }));
    }

    return featureCardBase.map((card, idx) => {
      const sourceCategory = categories[idx % categories.length];
      return {
        imageUrl: card.imageUrl,
        title: sourceCategory?.name ?? card.fallbackTitle,
        className: card.className,
        titleSize: card.titleSize,
        categoryName: sourceCategory?.name,
      };
    });
  }, [categories, featureCardBase]);

  const featuredCardsGrid1 = featuredCategoryCards.slice(0, 4);
  const featuredCardsGrid2 = featuredCategoryCards.slice(4, 9);

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

  const formatPrice = (price?: number | null) => {
    if (price === undefined || price === null) {
      return '';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(price);
  };

  const toProductCardProps = (product: Product) => {
    const imageUrl = product.pictures?.[0]?.url
      ? `http://localhost:8080/${product.pictures[0].url}`
      : 'https://via.placeholder.com/400x400?text=No+Image';

    const hasDiscount = product.priceWithoutDiscount && product.priceWithoutDiscount > product.price;
    const discountPercent = hasDiscount && product.priceWithoutDiscount
      ? Math.round(((product.priceWithoutDiscount - product.price) / product.priceWithoutDiscount) * 100)
      : null;

    return {
      id: product.id,
      slug: product.slug,
      imageUrl,
      title: product.name,
      price: formatPrice(product.price),
      oldPrice: hasDiscount ? formatPrice(product.priceWithoutDiscount) : undefined,
      discountPercent: discountPercent ? `-${discountPercent}%` : undefined,
    } as const;
  };

  useEffect(() => {
    let ignore = false;

    const loadPopularProducts = async () => {
      setPopularLoading(true);
      setPopularError(null);
      try {
        const products = await fetchProducts();
        if (ignore) return;

        const sorted = [...products]
          .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
          .slice(0, 10);

        setPopularProducts(sorted);
        setTimeout(() => {
          updateScrollButtons();
        }, 0);
      } catch (error) {
        if (!ignore) {
          setPopularError('Unable to load popular products right now. Please try again later.');
        }
      } finally {
        if (!ignore) {
          setPopularLoading(false);
        }
      }
    };

    loadPopularProducts();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!popularLoading) {
      updateScrollButtons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popularProducts, popularLoading]);

  useEffect(() => {
    AOS.refreshHard();
  }, [categories, popularProducts]);

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Navigation Bar */}
      <div
        className={`w-full h-14 ${styles.layout.flexCenter}`}
        style={{ backgroundColor: styles.colors.primary }}
      >
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
            {categoriesError ? (
              <div className="col-span-full text-center text-gray-500 text-sm">
                {categoriesError}
              </div>
            ) : categoriesLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={`category-skeleton-${idx}`} className="flex flex-col items-center space-y-4 animate-pulse">
                  <div className="w-41 h-41 rounded-full bg-gray-100" />
                  <div className="w-24 h-4 bg-gray-100 rounded" />
                  <div className="w-16 h-3 bg-gray-100 rounded" />
                  <div className="w-20 h-3 bg-gray-100 rounded" />
                </div>
              ))
            ) : resolvedCategories.length === 0 ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={`category-skeleton-${idx}`} className="flex flex-col items-center space-y-4 animate-pulse">
                  <div className="w-41 h-41 rounded-full bg-gray-100" />
                  <div className="w-24 h-4 bg-gray-100 rounded" />
                  <div className="w-16 h-3 bg-gray-100 rounded" />
                  <div className="w-20 h-3 bg-gray-100 rounded" />
                </div>
              ))
            ) : (
              resolvedCategories.map((category, idx) => (
                <CategoryCard key={`${category.title}-${idx}`} {...category} animationDelay={idx * 40} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Featured Collections Section */}
      <div className={styles.layout.sectionLarge}>
        <div className={styles.layout.container}>
          <div className="text-center mb-12 max-w-2xl mx-auto" data-aos="fade-up">
            <h2 className={styles.typography.sectionTitle} style={{ color: styles.colors.mediumGray }}>
              View Our Range Of Categories
            </h2>
            <p className={styles.typography.sectionDesc} style={{ color: styles.colors.textSecondary }}>
              Explore our diverse collection of products designed to suit every need. Whether you're looking for the latest tech, stylish fashion, or everyday essentials, we have something for everyone.
            </p>
          </div>

          {/* Featured Cards Grid 1 */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            <FeatureCard {...featuredCardsGrid1[0]} animationDelay={0} />
            <div className="space-y-8">
              <FeatureCard {...featuredCardsGrid1[1]} animationDelay={60} />
              <FeatureCard {...featuredCardsGrid1[2]} animationDelay={120} />
            </div>
            <FeatureCard {...featuredCardsGrid1[3]} animationDelay={90} />
          </div>

          {/* Featured Cards Grid 2 */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-8">
              <FeatureCard {...featuredCardsGrid2[0]} animationDelay={0} />
              <FeatureCard {...featuredCardsGrid2[1]} animationDelay={80} />
            </div>
            <FeatureCard {...featuredCardsGrid2[2]} animationDelay={140} />
            <div className="space-y-8">
              <FeatureCard {...featuredCardsGrid2[3]} animationDelay={60} />
              <FeatureCard {...featuredCardsGrid2[4]} animationDelay={160} />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className={styles.layout.sectionLarge}>
        <div className={styles.layout.container}>
          <div className="flex flex-col lg:flex-row lg:items-start gap-8 mb-12" data-aos="fade-up">
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
              <div key={`featured-${idx}`} data-aos="fade-up" data-aos-delay={idx * 60}>
                <ProductCard {...p} variant="grid" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="w-full py-60 relative overflow-hidden" data-aos="fade-up">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1920&q=80')",
            filter: 'brightness(0.7) contrast(0.1)'
          }}
        />
        
        <div className={`relative z-10 ${styles.layout.container} px-8`}>
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-6" data-aos="fade-right">
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

            <div className="lg:w-1/2 space-y-8" data-aos="fade-left">
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
          <div className="flex items-center justify-between mb-12" data-aos="fade-up">
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
                {popularLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={`popular-loading-${idx}`}
                      className="w-72 h-80 rounded-3xl bg-gray-100 animate-pulse"
                    />
                  ))
                ) : popularError ? (
                  <div className="min-h-48 flex items-center justify-center px-8 text-sm text-gray-500">
                    {popularError}
                  </div>
                ) : popularProducts.length === 0 ? (
                  <div className="min-h-48 flex items-center justify-center px-8 text-sm text-gray-500">
                    No popular products yet.
                  </div>
                ) : (
                  popularProducts.map((product, idx) => {
                    const cardProps = toProductCardProps(product);
                    return (
                      <div
                        key={`popular-${product.id ?? idx}`}
                        className="carousel-item transform transition-all duration-500"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                        data-aos="fade-up"
                        data-aos-delay={idx * 80}
                      >
                        <ProductCard {...cardProps} variant="carousel" />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default HomePage;

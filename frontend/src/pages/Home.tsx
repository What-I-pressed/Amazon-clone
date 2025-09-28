import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
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
    url: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    keywords: ['fashion', 'cloth', 'apparel', 'style'],
    url: 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    keywords: ['home', 'furn', 'decor', 'living'],
    url: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    keywords: ['beaut', 'cosmetic', 'skincare', 'makeup'],
    url: 'https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    keywords: ['sport', 'fitness', 'outdoor', 'athlet'],
    url: 'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    keywords: ['toy', 'kid', 'baby', 'play'],
    url: 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    keywords: ['book', 'literature', 'read', 'novel'],
    url: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    keywords: ['grocery', 'food', 'kitchen', 'culinary'],
    url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    keywords: ['health', 'wellness', 'medical', 'care'],
    url: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    keywords: ['office', 'work', 'stationery', 'suppl'],
    url: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800',
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
  const heroRef = useRef<HTMLDivElement>(null);
  const featuredCollectionsRef = useRef<HTMLDivElement>(null);
  const popularSectionRef = useRef<HTMLDivElement>(null);

  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [popularLoading, setPopularLoading] = useState<boolean>(false);
  const [popularError, setPopularError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [heroSearchTerm, setHeroSearchTerm] = useState("");

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
      searchBar: 'hover:shadow-lg hover:bg-[#e7e7e7]/80',
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
      mainTitle: 'font-afacad text-7xl  font-bold leading-tight',
      subtitle: 'font-afacad text-4xl leading-tight ',
      sectionTitle: 'font-afacad text-4xl font-bold mb-3',
      categoryTitle: 'font-poppins font-semibold text-lg',
      cardTitle: 'text-white font-poppins',
      description: 'font-poppins text-lg leading-relaxed max-w-4xl mx-auto px-4',
      sectionDesc: 'font-poppins text-base leading-relaxed',
      categorySubtext: 'font-poppins text-sm'
    }
  };

  // Reusable component for navigation buttons
  const NavButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center h-12 px-4 rounded-md cursor-pointer ${styles.transitions.fast} ${styles.hover.navButton}`}
    >
      <span className="text-white font-poppins text-base hover:text-gray-100">{label}</span>
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
      className="group flex flex-col items-center space-y-3 transition-transform duration-1000 mt-2 hover:-translate-y-0.5"
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
              className="text-center w-full transition duration-200 py-1 rounded-full hover:bg-gray-100/40 hover:text-[#151515]"
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

  const scrollToRef = useCallback((ref: React.RefObject<Element | null>) => {
    const node = ref.current;
    if (node && 'scrollIntoView' in node) {
      (node as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleHeroSearch = useCallback(() => {
    const query = heroSearchTerm.trim();
    if (!query) return;
    navigate(`/search?query=${encodeURIComponent(query)}`);
  }, [heroSearchTerm, navigate]);

  const navItems = useMemo(() => ([
    {
      label: 'All',
      onClick: () => scrollToRef(heroRef),
    },
    {
      label: 'Sell',
      onClick: () => navigate('/seller/dashboard'),
    },
    {
      label: 'Best Sellers',
      onClick: () => scrollToRef(popularSectionRef),
    },
    {
      label: 'Customer Service',
      onClick: () => navigate('/chat'),
    },
    {
      label: 'Electronics',
      onClick: () => navigate('/search?category=Electronics'),
    },
    {
      label: 'Fashion',
      onClick: () => navigate('/search?category=Clothing'),
    },
    {
      label: 'New Releases',
      onClick: () => scrollToRef(featuredCollectionsRef),
    },
  ]), [navigate, scrollToRef]);

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
      imageUrl: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800',
      fallbackTitle: 'electronics',
      className: 'lg:row-span-2 h-128',
      titleSize: 'text-2xl'
    },
    {
      imageUrl: 'https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg?auto=compress&cs=tinysrgb&w=800',
      fallbackTitle: 'office supplies'
    },
    {
      imageUrl: 'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=800',
      fallbackTitle: 'home and kitchen'
    },
    {
      imageUrl: 'https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&cs=tinysrgb&w=800',
      fallbackTitle: 'clothing',
      className: 'lg:row-span-2 h-128',
      titleSize: 'text-2xl'
    },
    {
      imageUrl: 'https://images.pexels.com/photos/3764015/pexels-photo-3764015.jpeg?auto=compress&cs=tinysrgb&w=800',
      fallbackTitle: 'beauty and personal care'
    },
    {
      imageUrl: 'https://images.pexels.com/photos/3661353/pexels-photo-3661353.jpeg?auto=compress&cs=tinysrgb&w=800',
      fallbackTitle: 'toys and games'
    },
    {
      imageUrl: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=800',
      fallbackTitle: 'health and wellness',
      className: 'lg:row-span-2 h-128',
      titleSize: 'text-2xl'
    },
    {
      imageUrl: 'https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg?auto=compress&cs=tinysrgb&w=800',
      fallbackTitle: 'books'
    },
    {
      imageUrl: 'https://images.pexels.com/photos/267761/pexels-photo-267761.jpeg?auto=compress&cs=tinysrgb&w=800',
      fallbackTitle: 'sports & outdoors'
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
      const categoryImage = sourceCategory ? getCategoryImage(sourceCategory.name, idx) : card.imageUrl;
      return {
        imageUrl: categoryImage ?? card.imageUrl,
        title: sourceCategory?.name ?? card.fallbackTitle,
        className: card.className,
        titleSize: card.titleSize,
        categoryName: sourceCategory?.name,
      };
    });
  }, [categories, featureCardBase]);

  const featuredCardsGrid1 = featuredCategoryCards.slice(0, 4);
  const featuredCardsGrid2 = featuredCategoryCards.slice(4, 9);

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
          {navItems.map(({ label, onClick }) => (
            <NavButton key={label} label={label} onClick={onClick} />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div ref={heroRef} className="relative w-full px-8 py-20 flex flex-col items-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: "url('/images/background/mainpagebg.png')" }} 
        />

        <div className="max-w-4xl mx-auto text-center space-y-2 relative z-10">
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
            <div className={`relative w-96 h-14 rounded-full border border-[#dadada] backdrop-blur-md bg-[#e7e7e7]/70 ${styles.transitions.normal} ${styles.hover.searchBar}`}>
              <input
                type="text"
                value={heroSearchTerm}
                onChange={(e) => setHeroSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleHeroSearch()}
                placeholder="Search An Item"
                className={`w-full h-full px-5 pr-16 bg-transparent text-base font-poppins placeholder-[#585858] focus:outline-none rounded-full hover:placeholder-[#454545] ${styles.transitions.fast}`}
                style={{ color: styles.colors.textInput }}
              />
              <button
                type="button"
                onClick={handleHeroSearch}
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
              <div className="col-span-full text-center text-[#838383] text-sm">
                {categoriesError}
              </div>
            ) : categoriesLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={`category-skeleton-${idx}`} className="flex flex-col items-center">
                  <div className="w-41 h-41 rounded-full bg-gray-100" />
                  <div className="w-21 h-4 bg-gray-100 rounded" />
                  <div className="w-18 h-3 bg-gray-100 rounded" />
                  <div className="w-12 h-3 bg-gray-100 rounded" />
                </div>
              ))
            ) : resolvedCategories.length === 0 ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={`category-skeleton-${idx}`} className="flex flex-col items-center space-y-2">
                  <div className="w-41 h-41 rounded-full bg-gray-100" />
                  <div className="w-24 h-4 bg-gray-100 rounded" />
                  <div className="w-16 h-3 bg-gray-100 rounded" />
                  <div className="w-20 h-3 bg-gray-100 rounded" />
                </div>
              ))
            ) : (
              resolvedCategories.map((category, idx) => (
                <CategoryCard key={`${category.title}-${idx}`} {...category} animationDelay={idx * 100} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Featured Collections Section */}
      <div ref={featuredCollectionsRef} className={`${styles.layout.sectionLarge}`}>
        <div className={styles.layout.container}>
          <div className="text-center mb-24 max-w-2xl mx-auto" data-aos="fade-up">
            <h2 className={styles.typography.sectionTitle}>
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
              <FeatureCard {...featuredCardsGrid1[1]} animationDelay={100} />
              <FeatureCard {...featuredCardsGrid1[2]} animationDelay={120} />
            </div>
            <FeatureCard {...featuredCardsGrid1[3]} animationDelay={10} />
          </div>

          {/* Featured Cards Grid 2 */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-8">
              <FeatureCard {...featuredCardsGrid2[0]} animationDelay={0} />
              <FeatureCard {...featuredCardsGrid2[1]} animationDelay={100} />
            </div>
            <FeatureCard {...featuredCardsGrid2[2]} animationDelay={140} />
            <div className="space-y-8">
              <FeatureCard {...featuredCardsGrid2[3]} animationDelay={100} />
              <FeatureCard {...featuredCardsGrid2[4]} animationDelay={160} />
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="w-full py-60 relative overflow-hidden mt-16" data-aos="fade-up">
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
                <button
                  className={`bg-[#282828] text-white font-semibold px-6 py-4 rounded-full flex items-center gap-3 ${styles.transitions.normal}`}
                  onClick={() => scrollToRef(featuredCollectionsRef)}
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
      <div ref={popularSectionRef} className="w-full py-16 bg-white">
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
          </div>

          {popularLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-10">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={`popular-loading-${idx}`}
                  className="transform transition-all duration-500"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                  data-aos="fade-up"
                  data-aos-delay={(idx % 4) * 80 + Math.floor(idx / 4) * 120}
                >
                  <ProductCard
                    variant="grid"
                    loading
                    imageUrl=""
                    title=""
                    price=""
                  />
                </div>
              ))}
            </div>
          ) : popularError ? (
            <div className="min-h-48 flex items-center justify-center px-8 text-sm text-[#838383]">
              {popularError}
            </div>
          ) : popularProducts.length === 0 ? (
            <div className="min-h-48 flex items-center justify-center px-8 text-sm text-[#838383]">
              No popular products yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-10">
              {popularProducts.slice(0, 8).map((product, idx) => {
                const cardProps = toProductCardProps(product);
                return (
                  <div
                    key={`popular-${product.id ?? idx}`}
                    className="transform transition-all duration-500"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                    data-aos="fade-up"
                    data-aos-delay={(idx % 4) * 80 + Math.floor(idx / 4) * 120}
                  >
                    <ProductCard {...cardProps} variant="grid" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default HomePage;

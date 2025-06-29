export interface Category {
    id: string;
    name: string;
    slug: string;        // для URL
    // Slug — це коротка зрозуміла частина URL з латинських літер і дефісів, що замінює ID для зручності та SEO.
    //  Наприклад, замість /category/7 буде /category/wireless-headphones :)
    parentId?: string;   // якщо є родительська категорія
    description?: string;
    image?: string;      // іконка або баннер категорії
  }
  
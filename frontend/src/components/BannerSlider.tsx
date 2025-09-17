import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/swiper-bundle.min.css";

const BannerSlider: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto my-6">
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="rounded-2xl shadow-lg"
      >
        {/* Слайд 1 */}
        <SwiperSlide>
          <img
            src="https://via.placeholder.com/1000x400/2563eb/ffffff?text=Знижки+до+50%"
            alt="Знижки"
            className="w-full h-96 object-contain rounded-2xl bg-white"
          />
        </SwiperSlide>

        {/* Слайд 2 */}
        <SwiperSlide>
          <img
            src="https://via.placeholder.com/1000x400/16a34a/ffffff?text=Нові+надходження"
            alt="Новинки"
            className="w-full h-96 object-contain rounded-2xl bg-white"
          />
        </SwiperSlide>

        {/* Слайд 3 */}
        <SwiperSlide>
          <img
            src="https://via.placeholder.com/1000x400/f59e0b/ffffff?text=Рекомендовані+товари"
            alt="Рекомендовані"
            className="w-full h-96 object-contain rounded-2xl bg-white"
          />
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default BannerSlider;

"use client";
import { useEffect } from "react";

const SaveToRecentlyViewed = ({ product }) => {
  useEffect(() => {
    if (!product || !product.id) return;

    try {
      // دریافت لیست فعلی
      const stored = localStorage.getItem("recentlyViewedProducts");
      let recentProducts = stored ? JSON.parse(stored) : [];

      // حذف محصول فعلی اگر قبلاً موجود بود
      recentProducts = recentProducts.filter(p => p.id !== product.id);

      // اضافه کردن محصول جدید به ابتدای لیست
      const productData = {
        id: product.id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        discount_price: product.discount_price,
        image: product.image,
        category: product.category,
        rate: product.rate,
        viewedAt: new Date().toISOString(),
      };

      recentProducts.unshift(productData);

      // نگه داشتن فقط 10 محصول آخر
      if (recentProducts.length > 10) {
        recentProducts = recentProducts.slice(0, 10);
      }

      // ذخیره در localStorage
      localStorage.setItem("recentlyViewedProducts", JSON.stringify(recentProducts));
    } catch (error) {
      console.error("Error saving to recently viewed:", error);
    }
  }, [product]);

  return null; // این component فقط برای ذخیره‌سازی است
};

export default SaveToRecentlyViewed;



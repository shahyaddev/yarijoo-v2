"use client";

import { toFarsiNumber } from "@/helper/helper";
import { UserContext } from "@/lib/UserProvider";
import { cartService } from "@/services/cartService";
import { siteURL } from "@/services/API";
import { Spinner } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useContext, useState } from "react";

const CartItem = ({ data }) => {
  const router = useRouter();
  const { setCart } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Get product info from API structure
  const product = data.info || data.product || data;
  
  // Get product image from images array
  let productImage = "";
  if (data.image && Array.isArray(data.image) && data.image.length > 0) {
    const imagePath = data.image[0]?.image || data.image[0];
    productImage = imagePath ? `${siteURL}/${imagePath}` : "";
  } else if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
    const imagePath = product.images[0]?.image || product.images[0];
    productImage = imagePath ? `${siteURL}/${imagePath}` : "";
  }
  
  const productTitle = product?.title || product?.name || "محصول";
  const productSlug = product?.slug || "";
  const productDescription = product?.description?.replace(/<[^>]*>/g, "").substring(0, 200) || 
                            product?.des?.replace(/<[^>]*>/g, "").substring(0, 200) || "";
  const productPrice = product?.price || data.cost || 0;
  const productOffPrice = product?.off_price || product?.discount_price || null;
  const quantity = data.qty || data.quantity || 1;
  const totalPrice = data.cost || (productPrice * quantity);
  const productType = data.type || product?.type || "physical";

  // حذف از سبد
  const removeCartHandler = async () => {
    setLoading(true);
    try {
      const response = await cartService.removeItem(data.id);
      if (response.success) {
        setCart(response.cart);
        router.refresh();
      }
    } catch (error) {
      console.error("خطا در حذف از سبد:", error);
      alert("خطا در حذف محصول از سبد خرید");
    } finally {
      setLoading(false);
    }
  };

  // بروزرسانی تعداد
  const updateQuantityHandler = async (newQuantity) => {
    if (newQuantity < 1 || newQuantity > 99) return;
    
    setUpdating(true);
    try {
      const response = await cartService.updateQuantity(data.id, newQuantity);
      if (response.success) {
        setCart(response.cart);
        router.refresh();
      }
    } catch (error) {
      console.error("خطا در بروزرسانی تعداد:", error);
      alert("خطا در بروزرسانی تعداد");
    } finally {
      setUpdating(false);
    }
  };

  // Get product type label
  const getProductTypeLabel = () => {
    const labels = {
      physical: "محصول فیزیکی",
      sms: "پنل SMS",
      course_package: "پکیج دوره",
    };
    return labels[productType] || "محصول";
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 border-b border-borderColor border-dashed pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
      {/* image */}
      <div className="w-full sm:w-4/12">
        <div className="w-full relative">
          <Link
            href={`/shop/${productSlug}`}
            className="w-full"
          >
            <Image
              src={productImage}
              width={300}
              height={150}
              className="w-full rounded-2xl object-cover aspect-video"
              alt={productTitle}
              onError={(e) => {
                e.target.src = "";
              }}
            />
          </Link>

          <button
            onClick={removeCartHandler}
            disabled={loading}
            className="size-11 absolute left-2/4 -translate-x-2/4 -bottom-[22px] text-primaryTextColor flex justify-center items-center bg-red-600 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Spinner size="sm" color="white" />
            ) : (
              <i className="fi fi-sr-cross h-4"></i>
            )}
          </button>
        </div>
      </div>

      {/* title & info */}
      <div className="w-full flex flex-col gap-4 sm:w-8/12 bg-gradient-to-b from-secondaryThemeColor to-darkThemeColor rounded-2xl p-5 pt-0 pb-6">
        <div className="w-full bg-darkThemeColor rounded-b-2xl p-5 flex flex-col gap-2">
          <div className="flex items-center text-xs font-semibold text-success gap-2">
            <div className="size-1 rounded-full bg-success"></div>
            <span>{getProductTypeLabel()}</span>
          </div>

          <Link href={`/shop/${productSlug}`}>
            <h1 className="text-sm text-primaryTextColor font-bold hover:text-primaryThemeColor transition-colors">
              {productTitle}
            </h1>
          </Link>
        </div>

        {/* info */}
        {productDescription && (
          <p className="text-xs text-secondaryTextColor line-clamp-2">
            {productDescription}
          </p>
        )}

        {/* price */}
        <div className="w-full flex justify-between items-center mt-1 pt-3 border-t border-borderColor">
          <span className="text-primaryTextColor text-sm font-bold">
            قیمت کل:
          </span>

          <div className="flex flex-col items-end gap-1">
            {productOffPrice && productOffPrice !== productPrice && (
              <span className="text-secondaryTextColor line-through text-xs">
                {toFarsiNumber(productOffPrice * quantity)}
              </span>
            )}

            <div className="flex items-center gap-1">
              <span className="text-xl font-black text-primaryThemeColor">
                {toFarsiNumber(totalPrice)}
              </span>
              <span className="text-xs text-secondaryTextColor">تومان</span>
            </div>
          </div>
        </div>

        <div className="w-full flex items-center gap-4">
          <Link
            href={`/shop/${productSlug}`}
            className="w-full h-11 rounded-full text-sm font-semibold bg-primaryThemeColor hover:opacity-80 text-darkThemeColor flex justify-center items-center transition-opacity"
          >
            مشاهده محصول
          </Link>

          <button className="min-w-11 h-11 text-red-600 flex justify-center items-center border border-red-600 rounded-full hover:bg-red-600 hover:text-primaryTextColor transition-all duration-300">
            <i className="fi fi-sr-heart text-xl h-5"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;

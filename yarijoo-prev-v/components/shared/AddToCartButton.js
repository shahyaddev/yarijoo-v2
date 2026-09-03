"use client";

import React, { useState, useContext } from "react";
import { cartService } from "@/services/cartService";
import { UserContext } from "@/lib/UserProvider";
import { Spinner } from "@nextui-org/react";
import { useRouter } from "next/navigation";

const AddToCartButton = ({ 
  productType = "physical", 
  productId, 
  productName,
  className = "",
  showQuantity = false 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { setCart } = useContext(UserContext);
  const router = useRouter();

  const handleAddToCart = async () => {
    if (!productId) {
      alert("شناسه محصول معتبر نیست");
      return;
    }

    setLoading(true);
    try {
      const response = await cartService.addToCart(productType, productId, quantity);
      
      if (response.success) {
        setCart(response.cart);
        alert(`${productName || "محصول"} به سبد خرید اضافه شد`);
        router.refresh();
      } else {
        alert(response.message || "خطا در افزودن به سبد خرید");
      }
    } catch (error) {
      console.error("خطا در افزودن به سبد:", error);
      const errorMessage = error.response?.data?.message || "خطا در افزودن به سبد خرید";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showQuantity && (
        <div className="flex items-center gap-2 bg-secondaryThemeColor rounded-lg p-1">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={loading || quantity <= 1}
            className="w-8 h-8 flex items-center justify-center text-primaryTextColor hover:bg-primaryThemeColor hover:text-darkThemeColor rounded-md transition-all disabled:opacity-50"
          >
            <i className="fi fi-rr-minus text-xs h-3"></i>
          </button>
          <span className="min-w-[40px] text-center text-primaryTextColor font-bold">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(99, quantity + 1))}
            disabled={loading || quantity >= 99}
            className="w-8 h-8 flex items-center justify-center text-primaryTextColor hover:bg-primaryThemeColor hover:text-darkThemeColor rounded-md transition-all disabled:opacity-50"
          >
            <i className="fi fi-rr-plus text-xs h-3"></i>
          </button>
        </div>
      )}

      <button
        onClick={handleAddToCart}
        disabled={loading}
        className="flex-1 h-12 rounded-full bg-primaryThemeColor hover:opacity-80 text-darkThemeColor font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        {loading ? (
          <>
            <Spinner size="sm" color="current" />
            <span>در حال افزودن...</span>
          </>
        ) : (
          <>
            <i className="fi fi-rr-shopping-cart-add h-4"></i>
            <span>افزودن به سبد خرید</span>
          </>
        )}
      </button>
    </div>
  );
};

export default AddToCartButton;

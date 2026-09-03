"use client";

import { toFarsiNumber } from "@/helper/helper";
import { UserContext } from "@/lib/UserProvider";
import { useUser } from "@/lib/useUser";
import { postData } from "@/services/API";
import { Button } from "@nextui-org/react";
import React, { useContext, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const Sidebar = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const { cart, setCart } = useContext(UserContext);
  const user = useUser();

  const addCartHandler = () => {
    if (user?.user?.id) {
      setLoading(true);
      postData("/shop/cart/add", { product_id: data.id, quantity: 1 }, true)
        .then((res) => {
          setCart(res.data);
          setLoading(false);
        })
        .catch((err) => {});
    } else {
      toast.error("لطفا ابتدا وارد حساب خود شوید");
    }
  };

  const removeCartHandler = () => {
    if (user?.user?.id) {
      setLoading(true);
      cart?.items?.forEach((c) => {
        if (c.info.id === data.id) {
          postData(`/shop/cart/delete`, { cart_id: c.id })
            .then((res) => {
              setCart(res.data);
              setLoading(false);
            })
            .catch((err) => {});
        }
      });
    } else {
      toast.error("لطفا ابتدا وارد حساب خود شوید");
    }
  };

  return (
    <div className="w-full lg:w-auto lg:min-w-[380px] h-fit flex flex-col gap-4 bg-gradient-to-b from-secondaryThemeColor to-darkThemeColor rounded-2xl p-5 pt-0">
      <Toaster />

      {/* title */}
      <div className="w-full h-16 flex items-center gap-2 px-5 rounded-b-2xl bg-darkThemeColor">
        <div className="flex items-center gap-1">
          <span className="size-1 rounded-full bg-primaryThemeColor"></span>
          <span className="size-2 rounded-full bg-primaryThemeColor"></span>
        </div>

        <span className="text-lg text-primaryTextColor font-black">
          خرید محصول
        </span>
      </div>

      {/* price  */}
      <div className="w-full flex justify-between text-primaryTextColor items-center">
        <span className="font-black">قیمت محصول</span>

        <div className="flex flex-col items-end">
          {data.off_price && (
            <span className="text-secondaryTextColor text-base line-through">
              {toFarsiNumber(data.off_price)}
            </span>
          )}

          <div className="flex items-center gap-1">
            <span className="text-xl font-black text-primaryTextColor">
              {toFarsiNumber(data.price)}
            </span>
            <span className="text-xs text-secondaryTextColor">تومان</span>
          </div>
        </div>
      </div>

      {/* next step button */}
      <div className="w-full flex items-center gap-4">
        {cart?.items?.filter((item) => item.info.id === data.id).length > 0 ? (
          <Button
            onPress={removeCartHandler}
            isLoading={loading}
            className="w-full rounded-full bg-red-600 text-primaryTextColor text-sm font-semibold"
          >
            <span>حذف از سبد خرید</span>
          </Button>
        ) : (
          <Button
            onPress={addCartHandler}
            isLoading={loading}
            className="w-full rounded-full bg-primaryThemeColor text-darkThemeColor text-sm font-semibold"
          >
            <span>افزودن به سبد خرید</span>
          </Button>
        )}

        <button className="min-w-11 h-11 text-red-600 flex justify-center items-center border border-red-600 rounded-full hover:bg-red-600 hover:text-primaryTextColor transition-all duration-300">
          <i className="fi fi-sr-heart text-xl h-5"></i>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

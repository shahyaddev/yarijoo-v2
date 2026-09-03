import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import SectionTitle from "@/components/shared/SectionTitle";
import { toFarsiNumber } from "@/helper/helper";
import React from "react";
import Footer from "@/components/footer/Footer";
import CartItem from "./CartItem";
import Sidebar from "./Sidebar";
import { cookies } from "next/headers";
import { baseURL } from "@/services/API";

const Page = async () => {
  const token = cookies().get("token")?.value;

  let userCart = { items: [] };
  
  try {
    const userCartRes = await fetch(`${baseURL}/shop/cart/index`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (userCartRes.ok) {
      userCart = await userCartRes.json();
    } else {
      console.error("Failed to fetch cart:", userCartRes.status);
    }
  } catch (error) {
    console.error("Error fetching cart:", error);
    userCart = { items: [] };
  }

  return (
    <div className="w-full flex flex-col gap-4 items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col gap-4 px-4 lg:mt-24">
        <SectionTitle
          text1="سبد خرید شما"
          text2={`${toFarsiNumber(
            userCart.items?.length || 0
          )} محصول به سبد اضافه کرده اید`}
          icon={"fi fi-sr-shopping-cart"}
        />

        {userCart.items && userCart.items.length > 0 ? (
          <div className="w-full flex flex-col lg:flex-row gap-4">
            <div className="w-full flex flex-col gap-6 h-auto rounded-2xl">
              {userCart.items.map((cartItem, index) => (
                <CartItem key={cartItem.id || cartItem.product_id || index} data={cartItem} />
              ))}
            </div>

            <Sidebar data={userCart} />
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-20 gap-6">
            <div className="w-32 h-32 rounded-full bg-secondaryThemeColor flex items-center justify-center">
              <i className="fi fi-sr-shopping-cart text-6xl text-secondaryTextColor h-16"></i>
            </div>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-2xl font-black text-primaryTextColor">
                سبد خرید شما خالی است!
              </h2>
              <p className="text-secondaryTextColor text-center">
                برای خرید محصولات به فروشگاه مراجعه کنید
              </p>
            </div>
            <a
              href="/shop"
              className="px-8 h-12 rounded-full bg-primaryThemeColor text-darkThemeColor font-bold flex items-center justify-center gap-2 hover:opacity-80 transition-all"
            >
              <i className="fi fi-rr-shopping-bag h-4"></i>
              <span>مشاهده فروشگاه</span>
            </a>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Page;

"use client";

import { toFarsiNumber } from "@/helper/helper";
import Link from "next/link";
import React from "react";

const Sidebar = ({ data }) => {
  // Handle different API response structures
  const items = data.items || [];
  const subtotal = data.subtotal || data.cost || data.total_cost || 0;
  const discount = data.discount || data.total_discount || 0;
  const tax = data.tax || Math.round((subtotal * 9) / 100); // 9% VAT
  const total = data.total || (subtotal + tax - discount);

  return (
    <div className="w-full lg:w-auto lg:min-w-[400px] h-auto flex flex-col gap-4 bg-gradient-to-b from-secondaryThemeColor to-darkThemeColor rounded-2xl p-5 pt-0 sticky top-24">
      {/* title */}
      <div className="w-full h-16 flex items-center gap-2 px-5 rounded-b-2xl bg-darkThemeColor">
        <div className="flex items-center gap-1">
          <span className="size-1 rounded-full bg-primaryThemeColor"></span>
          <span className="size-2 rounded-full bg-primaryThemeColor"></span>
        </div>

        <span className="text-lg text-primaryTextColor font-black">
          اطلاعات پرداخت
        </span>
      </div>

      {/* price numbers */}
      <div className="flex flex-col gap-3 mt-1">
        {/* items count */}
        <div className="w-full flex justify-between text-xs text-primaryTextColor items-center">
          <span className="font-bold">تعداد محصولات</span>
          <span className="text-base font-black text-primaryThemeColor">
            {toFarsiNumber(items.length)} عدد
          </span>
        </div>

        {/* subtotal */}
        <div className="w-full flex justify-between text-xs text-primaryTextColor items-center">
          <span className="font-bold">جمع جزء</span>

          <div className="flex items-center gap-1">
            <span className="text-base font-black">
              {toFarsiNumber(subtotal)}
            </span>
            <span className="text-secondaryTextColor">تومان</span>
          </div>
        </div>

        {/* tax */}
        <div className="w-full flex justify-between text-xs text-primaryTextColor items-center">
          <span className="font-bold">مالیات بر ارزش افزوده (۹٪)</span>

          <div className="flex items-center gap-1">
            <span className="text-base font-black">{toFarsiNumber(tax)}</span>
            <span className="text-secondaryTextColor">تومان</span>
          </div>
        </div>

        {/* discount */}
        {discount > 0 && (
          <div className="w-full flex justify-between text-xs text-success items-center">
            <span className="font-bold">تخفیف</span>

            <div className="flex items-center gap-1">
              <span className="text-base font-black">
                -{toFarsiNumber(discount)}
              </span>
              <span className="text-secondaryTextColor">تومان</span>
            </div>
          </div>
        )}
      </div>

      {/* paying price */}
      <div className="w-full flex justify-between text-primaryTextColor items-center border-t border-borderColor pt-4 border-dashed">
        <span className="text-sm font-bold">مبلغ قابل پرداخت</span>

        <div className="flex items-center gap-1">
          <span className="text-2xl font-black text-primaryThemeColor">
            {toFarsiNumber(total)}
          </span>
          <span className="text-secondaryTextColor text-xs">تومان</span>
        </div>
      </div>

      {/* next step button */}
      <Link
        href="/checkout"
        className="w-full h-12 bg-success rounded-full text-darkThemeColor text-sm font-semibold hover:opacity-80 transition-all duration-300 flex items-center justify-center gap-2"
      >
        <i className="fi fi-rr-shopping-cart-check h-4"></i>
        <span>ادامه فرایند پرداخت</span>
      </Link>

      {/* continue shopping */}
      <Link
        href="/shop"
        className="w-full h-12 bg-transparent border border-primaryThemeColor rounded-full text-primaryThemeColor text-sm font-semibold hover:bg-primaryThemeColor hover:text-darkThemeColor transition-all duration-300 flex items-center justify-center gap-2"
      >
        <i className="fi fi-rr-shopping-bag h-4"></i>
        <span>ادامه خرید</span>
      </Link>
    </div>
  );
};

export default Sidebar;

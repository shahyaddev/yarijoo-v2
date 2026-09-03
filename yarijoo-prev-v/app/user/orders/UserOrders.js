"use client";

import { toFarsiNumber } from "@/helper/helper";
import React, { useState } from "react";
import OrderItem from "./OrderItem";
import Link from "next/link";

const UserOrders = ({ orders }) => {
  const [status, setStatus] = useState("paid");

  if (!orders || orders.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-6 py-12 md:py-16">
        <div className="w-24 h-24 rounded-full bg-darkThemeColor flex items-center justify-center">
          <i className="fi fi-rr-shopping-cart text-4xl text-secondaryTextColor"></i>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-lg font-semibold text-primaryTextColor">
            هیچ سفارشی یافت نشد
          </span>
          <p className="text-sm text-secondaryTextColor max-w-md">
            شما هنوز سفارشی ثبت نکرده‌اید. برای مشاهده محصولات و ثبت سفارش به فروشگاه مراجعه کنید.
          </p>
        </div>
        <Link
          href="/shop"
          className="mt-2 text-lg font-bold flex items-center gap-2 text-primaryThemeColor hover:text-primaryThemeColor/80 transition-colors"
        >
          <i className="fi fi-sr-store-alt text-lg h-[18px]"></i>
          <span>رفتن به صفحه فروشگاه</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* filter orders */}
      <div className="flex md:gap-4 gap-3 items-center flex-wrap pb-2">
        <button
          onClick={() => setStatus("paid")}
          className={`px-4 py-2.5 min-w-fit rounded-xl flex items-center gap-3 transition-all duration-300 ${
            status === "paid"
              ? "bg-primaryThemeColor text-white shadow-lg shadow-primaryThemeColor/20"
              : "bg-darkThemeColor text-primaryTextColor hover:bg-darkThemeColor/80 border border-borderColor/30"
          }`}
        >
          <div
            className={`w-8 h-8 flex justify-center items-center text-sm font-black rounded-lg ${
              status === "paid"
                ? "bg-white/20 text-white"
                : "bg-secondaryThemeColor text-primaryTextColor"
            }`}
          >
            {toFarsiNumber(
              orders.filter(
                (order) => order.status === "paid" || order.status === "done"
              ).length
            )}
          </div>
          <span className="text-sm font-semibold">موفق</span>
        </button>

        <button
          onClick={() => setStatus("to-pay")}
          className={`px-4 py-2.5 min-w-fit rounded-xl flex items-center gap-3 transition-all duration-300 ${
            status === "to-pay"
              ? "bg-primaryThemeColor text-white shadow-lg shadow-primaryThemeColor/20"
              : "bg-darkThemeColor text-primaryTextColor hover:bg-darkThemeColor/80 border border-borderColor/30"
          }`}
        >
          <div
            className={`w-8 h-8 flex justify-center items-center text-sm font-black rounded-lg ${
              status === "to-pay"
                ? "bg-white/20 text-white"
                : "bg-secondaryThemeColor text-primaryTextColor"
            }`}
          >
            {toFarsiNumber(
              orders.filter(
                (order) => order.status === "toPay" || order.status === "paying"
              ).length
            )}
          </div>
          <span className="text-sm font-semibold">در انتظار پرداخت</span>
        </button>

        <button
          onClick={() => setStatus("faild")}
          className={`px-4 py-2.5 min-w-fit rounded-xl flex items-center gap-3 transition-all duration-300 ${
            status === "faild"
              ? "bg-primaryThemeColor text-white shadow-lg shadow-primaryThemeColor/20"
              : "bg-darkThemeColor text-primaryTextColor hover:bg-darkThemeColor/80 border border-borderColor/30"
          }`}
        >
          <div
            className={`w-8 h-8 flex justify-center items-center text-sm font-black rounded-lg ${
              status === "faild"
                ? "bg-white/20 text-white"
                : "bg-secondaryThemeColor text-primaryTextColor"
            }`}
          >
            {toFarsiNumber(
              orders.filter((order) => order.status === "failed").length
            )}
          </div>
          <span className="text-sm font-semibold">لغو شده</span>
        </button>
      </div>

      <div className="w-full flex flex-col gap-4">
        {orders.map((order) =>
          status === "paid"
            ? (order.status === "paid" || order.status === "done") && (
                <OrderItem key={order.id} data={order} />
              )
            : status === "to-pay"
            ? (order.status === "toPay" || order.status === "paying") && (
                <OrderItem key={order.id} data={order} />
              )
            : order.status === "failed" && <OrderItem key={order.id} data={order} />
        )}
      </div>
    </div>
  );
};

export default UserOrders;

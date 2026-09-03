import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React from "react";
import Sidebar from "../Sidebar";
import Footer from "@/components/footer/Footer";
import { baseURL } from "@/services/API";
import { cookies } from "next/headers";
import UserOrders from "./UserOrders";

const Orders = async () => {
  const token = cookies().get("token")?.value;

  const userOrdersRes = await fetch(`${baseURL}/shop/order/index`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let userOrders = [];
  
  if (userOrdersRes.ok) {
    const ordersData = await userOrdersRes.json();
    userOrders = Array.isArray(ordersData.data) ? ordersData.data : ordersData.data?.data || [];
  }

  return (
    <div className="w-full flex flex-col items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />

        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-4 md:p-6">
          <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-borderColor/30">
            <div className="flex flex-col gap-2">
              <span className="text-2xl md:text-3xl font-black text-primaryTextColor">
                سفارشات من
              </span>
              <p className="text-sm text-secondaryTextColor">
                مدیریت و پیگیری سفارش‌های شما
              </p>
            </div>
          </div>

          <UserOrders orders={userOrders || []} />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Orders;

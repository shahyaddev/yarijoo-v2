import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React from "react";
import Sidebar from "../Sidebar";
import Footer from "@/components/footer/Footer";
import { baseURL } from "@/services/API";
import { cookies } from "next/headers";
import { toFarsiNumber } from "@/helper/helper";

const SmsPackages = async () => {
  const token = cookies().get("token")?.value;

  let packages = [];
  let error = null;

  if (token) {
    try {
      const packagesRes = await fetch(`${baseURL}/package/user/packages`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("SMS Packages Response Status:", packagesRes.status);

      if (packagesRes.ok) {
        const packagesData = await packagesRes.json();
        console.log("SMS Packages Raw Data:", packagesData);
        
        if (packagesData.status === "success" && packagesData.packages) {
          // فیلتر کردن پکیج‌های پیامکی (product_type === 'sms')
          packages = Array.isArray(packagesData.packages)
            ? packagesData.packages.filter((pkg) => {
                return pkg.product_type === "sms";
              })
            : [];
          
          console.log("Filtered SMS Packages:", packages);
        }
      } else {
        error = "خطا در دریافت اطلاعات";
        console.error("SMS Packages API Error:", packagesRes.status, packagesRes.statusText);
      }
    } catch (err) {
      console.error("Error fetching SMS packages:", err);
      error = "خطا در ارتباط با سرور";
    }
  } else {
    console.log("No token found for SMS packages");
  }

  console.log("Final SMS Packages:", packages);

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
                خریدهای بسته‌های پیامکی
              </span>
              <p className="text-sm text-secondaryTextColor">
                مدیریت و مشاهده بسته‌های پیامکی خریداری شده
              </p>
            </div>
          </div>

          {error ? (
            <div className="w-full flex flex-col items-center gap-4 py-8">
              <span className="text-sm text-red-600">{error}</span>
            </div>
          ) : packages.length > 0 ? (
            <div className="w-full flex flex-col gap-4">
              {packages.map((pkg, index) => (
                <div
                  key={pkg.id || index}
                  className="w-full flex flex-col bg-darkThemeColor rounded-xl p-4 gap-3 border border-borderColor/20"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-primaryTextColor font-semibold">
                        {pkg.name || pkg.title || `بسته پیامکی ${pkg.id}`}
                      </span>
                      {pkg.description && (
                        <span className="text-secondaryTextColor text-sm">
                          {pkg.description}
                        </span>
                      )}
                    </div>
                    {pkg.price && (
                      <div className="text-primaryThemeColor font-bold">
                        {toFarsiNumber(Number(pkg.price))} تومان
                      </div>
                    )}
                  </div>
                  {pkg.created_at && (
                    <div className="text-secondaryTextColor text-xs">
                      تاریخ خرید:{" "}
                      {new Intl.DateTimeFormat("fa-IR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }).format(new Date(pkg.created_at))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center py-20 gap-6 bg-darkThemeColor rounded-2xl">
              <div className="w-32 h-32 rounded-full bg-secondaryThemeColor flex items-center justify-center">
                <i className="fi fi-rr-comment-sms text-6xl text-secondaryTextColor h-16"></i>
              </div>
              <div className="flex flex-col items-center gap-2">
                <h2 className="text-2xl font-black text-primaryTextColor">
                  هنوز بسته پیامکی خریداری نکرده‌اید
                </h2>
                <p className="text-secondaryTextColor text-center">
                  شما در حال حاضر بسته پیامکی خریداری شده‌ای ندارید
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SmsPackages;

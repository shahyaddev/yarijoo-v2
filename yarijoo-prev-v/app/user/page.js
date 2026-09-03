import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React from "react";
import Sidebar from "./Sidebar";
import { getUser, tokenExpired } from "@/lib/storage";
import Footer from "@/components/footer/Footer";
import Link from "next/link";
import { toFarsiNumber } from "@/helper/helper";
import { baseURL } from "@/services/API";
import { cookies } from "next/headers";

const User = async () => {
  const user = await getUser();
  const token = cookies().get("token")?.value;
console.log(user);
  let userHistory = null;
  try {
    const userHistoryRes = await fetch(`${baseURL}/report/user-activity`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (userHistoryRes.ok) {
      const contentType = userHistoryRes.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        userHistory = await userHistoryRes.json();
      }
    }
  } catch (error) {
    console.error("Error fetching user history:", error);
    userHistory = null;
  }

  // دریافت پکیج‌های خریداری شده
  let userPackages = [];
  if (token) {
    try {
      const packagesRes = await fetch(`${baseURL}/package/user/packages`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
      
      if (packagesRes.ok) {
        const contentType = packagesRes.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            const packagesData = await packagesRes.json();
            if (packagesData.status === 'success') {
              userPackages = packagesData.packages || [];
            }
          } catch (error) {
            console.error("Error parsing packages response:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user packages:", error);
    }
  }

  // دریافت تست‌های انجام شده کاربر
  let userTests = [];
  let testsCount = 0;
  if (token) {
    try {
      const testsRes = await fetch(`${baseURL}/tests/complete-history`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
      
      if (testsRes.ok) {
        const contentType = testsRes.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            const testsData = await testsRes.json();
            if (testsData.success && testsData.data?.history) {
              // تبدیل object به array و محدود کردن به 6 تست اخیر
              const history = testsData.data.history;
              userTests = Object.entries(history)
                .map(([testName, testData]) => ({
                  testName,
                  ...testData,
                  latestResult: testData.results?.[0] || null,
                }))
                .filter((test) => test.latestResult)
                .sort((a, b) => {
                  const dateA = new Date(a.latestResult.date || 0);
                  const dateB = new Date(b.latestResult.date || 0);
                  return dateB - dateA;
                })
                .slice(0, 6);
              
              // محاسبه تعداد کل تست‌های انجام شده
              testsCount = Object.keys(history).length;
            }
          } catch (error) {
            console.error("Error parsing tests response:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user tests:", error);
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />

        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-4">
          <div className="w-full h-14 bg-darkThemeColor rounded-2xl flex justify-between items-center p-4">
            {/* name & welcome to user */}
            <div className="text-secondaryTextColor">
              <span className="text-primaryTextColor font-black text-lg">
                {user?.user?.name + " " + user?.user?.family_name}
              </span>{" "}
              عزیز خوش آمدی 😍
            </div>

            {/* buttons */}
            <div className="flex items-center gap-3">
              <Link
                href={"/user/messages"}
                className="size-9 flex relative items-center justify-center rounded-xl bg-primaryThemeColor"
              >
                {(user?.messages?.length || 0) > 0 && (
                  <div className="size-5 absolute pb-[3px] text-xs -top-[8px] -right-[8px] rounded-full flex justify-center items-center text-primaryThemeColor bg-secondaryThemeColor border-2 border-darkThemeColor">
                    {toFarsiNumber(user.messages.length)}
                  </div>
                )}

                <i className="fi fi-sr-envelope text-base h-[16px] text-darkThemeColor"></i>
              </Link>
            </div>
          </div>

          {/* user analytics */}
          <div className="w-full flex flex-col gap-6">
            {/* history */}
            <div className="w-full flex flex-col gap-2">
              <span className="text-xl font-black text-primaryTextColor">
                سوابق من
              </span>

              <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* signed up date */}
                <div className="w-full p-5 flex items-center gap-2 bg-darkThemeColor rounded-2xl transition-all duration-300">
                  <div className="size-14 rounded-2xl flex justify-center items-center bg-secondaryThemeColor">
                    <i className="fi fi-rr-calendar-day text-2xl h-[24px] text-primaryThemeColor"></i>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-secondaryTextColor">تاریخ پیوستن</span>
                    <span className="text-primaryTextColor font-semibold">
                      {user?.info?.created_at
                        ? new Intl.DateTimeFormat("fa-IR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }).format(new Date(user.info.created_at))
                        : "-"}
                    </span>
                  </div>
                </div>

                {/* my payment */}
                <div className="w-full p-5 flex items-center gap-2 bg-darkThemeColor rounded-2xl transition-all duration-300">
                  <div className="size-14 rounded-2xl flex justify-center items-center bg-secondaryThemeColor">
                    <i className="fi fi-rr-credit-card-buyer text-2xl h-[24px] text-primaryThemeColor"></i>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-secondaryTextColor">
                      مجموع پرداخت های من
                    </span>
                    <span className="text-primaryTextColor font-semibold">
                      {toFarsiNumber(userHistory?.orders_total || 0)} تومان
                    </span>
                  </div>
                </div>

                {/* my orders */}
                <div className="w-full p-5 flex items-center gap-2 bg-darkThemeColor rounded-2xl transition-all duration-300">
                  <div className="size-14 rounded-2xl flex justify-center items-center bg-secondaryThemeColor">
                    <i className="fi fi-rr-order-history text-2xl h-[24px] text-primaryThemeColor"></i>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-secondaryTextColor">سفارشات من</span>
                    <span className="text-primaryTextColor font-semibold">
                      {toFarsiNumber(userHistory?.orders_count || 0)} سفارش
                    </span>
                  </div>
                </div>

                {/* my tickets */}
                <div className="w-full p-5 flex items-center gap-2 bg-darkThemeColor rounded-2xl transition-all duration-300">
                  <div className="size-14 rounded-2xl flex justify-center items-center bg-secondaryThemeColor">
                    <i className="fi fi-rr-order-history text-2xl h-[24px] text-primaryThemeColor"></i>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-secondaryTextColor">تیکت های من</span>
                    <span className="text-primaryTextColor font-semibold">
                      {toFarsiNumber(userHistory?.tickets || 0)} تیکت
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* تست‌های من */}
            <div className="w-full flex flex-col gap-2">
              <div className="w-full flex justify-between items-center">
                <span className="text-xl font-black text-primaryTextColor">
                  تست‌های من
                </span>

                <Link
                  href={"/user/tests"}
                  className="hidden lg:flex items-center text-sm text-primaryTextColor gap-2 hover:text-primaryThemeColor transition-colors"
                >
                  <span>مشاهده همه تست‌ها</span>
                  <i className="fi fi-rr-arrow-left h-[14px]"></i>
                </Link>
              </div>

              {userTests.length > 0 ? (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userTests.map((test) => {
                    const testInfo = test.test_info || {};
                    const result = test.latestResult;
                    const testDate = result?.date ? new Date(result.date) : null;
                    
                    return (
                      <Link
                        key={test.testName}
                        href={`/user/tests/${test.testName}`}
                        className="w-full p-5 bg-darkThemeColor rounded-2xl border border-borderColor/40 hover:border-primaryThemeColor/60 transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="flex items-start gap-4">
                          <div className="size-14 rounded-xl bg-primaryThemeColor/15 border border-primaryThemeColor/30 flex items-center justify-center shrink-0">
                            <i className="fi fi-rr-clipboard-list-check text-2xl text-primaryThemeColor h-6"></i>
                          </div>
                          <div className="flex flex-col gap-2 flex-1 min-w-0">
                            <h3 className="text-base font-black text-primaryTextColor line-clamp-2">
                              {testInfo.title || testInfo.name || test.testName}
                            </h3>
                            {result && (
                              <div className="flex flex-col gap-1.5">
                                {result.score !== undefined && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-secondaryTextColor">امتیاز:</span>
                                    <span className="text-primaryThemeColor font-semibold">
                                      {toFarsiNumber(result.score)}
                                    </span>
                                  </div>
                                )}
                                {result.level && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="px-2 py-1 rounded-lg bg-primaryThemeColor/15 text-primaryThemeColor">
                                      {result.level}
                                    </span>
                                  </div>
                                )}
                                {testDate && (
                                  <div className="flex items-center gap-2 text-xs text-secondaryTextColor">
                                    <i className="fi fi-rr-calendar text-primaryThemeColor"></i>
                                    <span>
                                      {new Intl.DateTimeFormat("fa-IR", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      }).format(testDate)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <i className="fi fi-rr-angle-left text-primaryThemeColor h-4 shrink-0 mt-1"></i>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="w-full flex flex-col items-center gap-4 p-6 bg-darkThemeColor rounded-2xl border border-borderColor/40">
                  <div className="size-16 rounded-full bg-primaryThemeColor/15 border border-primaryThemeColor/30 flex items-center justify-center">
                    <i className="fi fi-rr-clipboard-list-check text-3xl text-primaryThemeColor h-8"></i>
                  </div>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="text-base font-semibold text-primaryTextColor">
                      تست‌های روانشناسی
                    </span>
                    <p className="text-sm text-secondaryTextColor max-w-md">
                      با انجام تست‌های روانشناسی، از وضعیت سلامت روان و ویژگی‌های شخصیتی خود آگاه شوید
                    </p>
                  </div>
                  <Link
                    href={"/user/tests"}
                    className="mt-2 px-6 py-3 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors flex items-center gap-2"
                  >
                    <i className="fi fi-rr-clipboard-list-check text-base"></i>
                    <span>مشاهده تست‌ها</span>
                  </Link>
                </div>
              )}
            </div>

            {/* پیام آموزی */}
            <div className="w-full flex flex-col gap-2">
              <div className="w-full flex justify-between items-center">
                <span className="text-xl font-black text-primaryTextColor">
                  پیام آموزی
                </span>

                <Link
                  href={"/payammooz"}
                  className="hidden lg:flex items-center text-sm text-primaryTextColor gap-2 hover:text-primaryThemeColor transition-colors"
                >
                  <span>مشاهده همه پکیج‌ها</span>
                  <i className="fi fi-rr-arrow-left h-[14px]"></i>
                </Link>
              </div>

              {userPackages.length > 0 ? (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userPackages.map((pkg) => (
                    <Link
                      key={pkg.id}
                      href={`/payammooz/${pkg.slug}`}
                      className="w-full p-5 bg-darkThemeColor rounded-2xl border border-borderColor/40 hover:border-primaryThemeColor/60 transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="size-14 rounded-xl bg-primaryThemeColor/15 border border-primaryThemeColor/30 flex items-center justify-center shrink-0">
                          <i className="fi fi-rr-envelope text-2xl text-primaryThemeColor h-6"></i>
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                          <h3 className="text-base font-black text-primaryTextColor line-clamp-2">
                            {pkg.title}
                          </h3>
                          <p className="text-sm text-secondaryTextColor line-clamp-2">
                            {pkg.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-secondaryTextColor mt-1">
                            <i className="fi fi-rr-clock text-primaryThemeColor"></i>
                            <span>ارسال روزانه: {toFarsiNumber(pkg.dispatch_rate)} پیام</span>
                          </div>
                        </div>
                        <i className="fi fi-rr-angle-left text-primaryThemeColor h-4 shrink-0 mt-1"></i>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="w-full flex flex-col items-center gap-4 p-6 bg-darkThemeColor rounded-2xl border border-borderColor/40">
                  <i className="fi fi-rr-envelope text-4xl text-secondaryTextColor h-10"></i>
                  <span className="text-sm text-secondaryTextColor text-center">
                    شما هنوز پکیج پیام آموزی خریداری نکرده‌اید
                  </span>
                  <Link
                    href={"/payammooz"}
                    className="text-base font-bold flex items-center gap-2 text-primaryThemeColor hover:text-primaryThemeColor/80 transition-colors"
                  >
                    <i className="fi fi-rr-shopping-cart text-lg h-[18px]"></i>
                    <span>مشاهده پکیج‌های پیام آموزی</span>
                  </Link>
                </div>
              )}
            </div>

            <div className="w-full flex flex-col gap-2">
              <div className="w-full flex justify-between items-center">
                <span className="text-xl font-black text-primaryTextColor">
                  آخرین سفارش من
                </span>

                <div className="hidden lg:flex items-center text-sm text-primaryTextColor gap-2">
                  <span>مشاهده همه سفارشات</span>

                  <i className="fi fi-rr-arrow-left h-[14px]"></i>
                </div>
              </div>

              <div className="w-full flex flex-col items-center gap-4">
                <span className="text-sm text-secondaryTextColor">
                  شما در حال حاضر سفارش تکمیل شده ای ندارید !
                </span>

                <Link
                  href={"/shop"}
                  className="text-lg font-bold flex items-center gap-2 text-primaryTextColor"
                >
                  <i className="fi fi-sr-store-alt text-lg h-[18px]"></i>

                  <span>رفتن به صفحه فروشگاه</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default User;

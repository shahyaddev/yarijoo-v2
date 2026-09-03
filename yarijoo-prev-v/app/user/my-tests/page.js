"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import Footer from "@/components/footer/Footer";
import Link from "next/link";
import { baseURL } from "@/services/API";
import { toFarsiNumber } from "@/helper/helper";

const Page = () => {
  const [userTests, setUserTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // دریافت تست‌های انجام شده کاربر
  useEffect(() => {
    const fetchUserTests = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const testsRes = await fetch(`${baseURL}/tests/complete-history`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (testsRes.ok) {
          const contentType = testsRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const testsData = await testsRes.json();
            if (testsData.success && testsData.data?.history) {
              const history = testsData.data.history;
              const testList = Object.entries(history)
                .map(([testName, testData]) => {
                  const latestResult = testData.results?.[0] || null;
                  return {
                    testName,
                    name: testData.test_info?.name || testName.replace(/_/g, ' '),
                    link: `/user/tests/${testName}`,
                    latestResult,
                    totalResults: testData.results?.length || 0,
                  };
                })
                .filter((test) => test.latestResult)
                .sort((a, b) => {
                  const dateA = new Date(a.latestResult.date || 0);
                  const dateB = new Date(b.latestResult.date || 0);
                  return dateB - dateA;
                });
              setUserTests(testList);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user tests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTests();
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />

        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-4 md:p-6">
          {/* Header */}
          <div className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl md:text-3xl font-black text-primaryTextColor">
                تست‌های من
              </h1>
              <p className="text-sm text-secondaryTextColor">
                لیست تست‌های روانشناسی که انجام داده‌اید
              </p>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="w-full flex flex-col items-center justify-center gap-4 py-12">
              <div className="w-12 h-12 border-4 border-primaryThemeColor border-t-transparent rounded-full animate-spin"></div>
              <span className="text-secondaryTextColor">در حال بارگذاری...</span>
            </div>
          ) : userTests.length > 0 ? (
            /* Tests List */
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              {userTests.map((test) => {
                const testDate = test.latestResult?.date
                  ? new Date(test.latestResult.date)
                  : null;

                return (
                  <Link
                    key={test.testName}
                    href={test.link}
                    className="w-full p-5 bg-darkThemeColor rounded-2xl border border-borderColor/40 hover:border-green-500/60 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="size-14 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center shrink-0">
                        <i className="fi fi-rr-clipboard-list-check text-2xl text-green-500 h-6"></i>
                      </div>
                      <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-black text-primaryTextColor line-clamp-2">
                            {test.name}
                          </h3>
                          <div className="size-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                            <i className="fi fi-sr-check text-white text-xs"></i>
                          </div>
                        </div>
                        {test.latestResult && (
                          <div className="flex flex-col gap-1.5">
                            {test.latestResult.score !== undefined && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-secondaryTextColor">امتیاز:</span>
                                <span className="text-green-500 font-semibold">
                                  {toFarsiNumber(test.latestResult.score)}
                                </span>
                              </div>
                            )}
                            {test.latestResult.level && (
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 rounded-lg bg-green-500/15 text-green-500 text-xs font-medium">
                                  {test.latestResult.level}
                                </span>
                              </div>
                            )}
                            {testDate && (
                              <div className="flex items-center gap-2 text-xs text-secondaryTextColor">
                                <i className="fi fi-rr-calendar text-green-500"></i>
                                <span>
                                  {new Intl.DateTimeFormat("fa-IR", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }).format(testDate)}
                                </span>
                              </div>
                            )}
                            {test.totalResults > 1 && (
                              <div className="flex items-center gap-2 text-xs text-secondaryTextColor">
                                <i className="fi fi-rr-clock text-green-500"></i>
                                <span>{toFarsiNumber(test.totalResults)} بار انجام شده</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <i className="fi fi-rr-angle-left text-green-500 h-4 shrink-0 mt-1"></i>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="w-full flex flex-col items-center justify-center gap-6 py-12 md:py-16">
              <div className="w-24 h-24 rounded-full bg-darkThemeColor flex items-center justify-center">
                <i className="fi fi-rr-clipboard-list-check text-4xl text-secondaryTextColor"></i>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-lg font-semibold text-primaryTextColor">
                  هنوز تستی انجام نداده‌اید
                </span>
                <p className="text-sm text-secondaryTextColor max-w-md">
                  برای مشاهده نتایج تست‌ها، ابتدا باید تست‌های روانشناسی را انجام دهید
                </p>
              </div>
              <Link
                href="/user/tests"
                className="mt-2 px-6 py-3 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors flex items-center gap-2"
              >
                <i className="fi fi-rr-clipboard-list-check text-base"></i>
                <span>مشاهده تست‌ها</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Page;



import React from "react";
import Sidebar from "@/app/user/Sidebar";
import MobileHeader from "@/components/header/MobileHeader";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { baseURL } from "@/services/API";
import { cookies } from "next/headers";
import AHSTest from "./AHSTest";
import { toFarsiNumber } from "@/helper/helper";
import ChartResult from "./ChartResult";

const Page = async () => {
  const token = await cookies().get("token").value;

  const fetchData = async () => {
    try {
      const userTestRes = await fetch(`${baseURL}/tests/ahs/results`, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (userTestRes.ok) {
        const contentType = userTestRes.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const userTest = await userTestRes.json();
          return { userTest };
        }
      }
      return { userTest: null };
    } catch (error) {
      console.error("Error fetching test results:", error);
      return { userTest: null };
    }
  };

  const { userTest } = await fetchData();

  return (
    <div className="w-full flex flex-col items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />

        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-4">
          <span className="text-xl font-black text-primaryTextColor">
            {userTest?.agency_score
              ? "نتیجه تست امید به زندگی اشنایدر"
              : "تست امید به زندگی اشنایدر"}
          </span>
          {/* result if exist */}
          {userTest?.agency_score ? (
            <div className="w-full flex flex-col">
              <div className="w-full flex justify-center items-center bg-darkThemeColor h-14 rounded-t-2xl border border-borderColor">
                <h2 className="text-xl text-primaryTextColor font-bold">
                  امتیاز آزمون شما : {toFarsiNumber(userTest?.total_score)}
                </h2>
              </div>
              <div className="w-full flex flex-col gap-8 items-center border border-t-0 border-borderColor border-dashed rounded-b-2xl sm:p-5 p-3 !pt-0">
                <ChartResult chartData={userTest} />

                <div
                  dangerouslySetInnerHTML={{ __html: userTest?.interpretation }}
                  className="text-primaryTextColor text-justify text-sm"
                ></div>
              </div>
            </div>
          ) : (
            <AHSTest />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Page;

import React from "react";
import Sidebar from "@/app/user/Sidebar";
import MobileHeader from "@/components/header/MobileHeader";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import GottmanTest from "./GottmanTest";
import { baseURL } from "@/services/API";
import { cookies } from "next/headers";
import ChartResult from "./ChartResult";

const Page = async () => {
  const token = await cookies().get("token").value;
  console.log(token);
  let userTest = null;
  try {
    const userTestRes = await fetch(`${baseURL}/tests/gottman/divorce/results`, {
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
        userTest = await userTestRes.json();
      }
    }
  } catch (error) {
    console.error("Error fetching gottman test results:", error);
    userTest = null;
  }

  const options = {
    series: [76],
    options: {
      colors: ["#fbc02d"],
      chart: {
        height: 350,
        type: "radialBar",
        offsetY: -10,
      },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          track: {
            background: "#222529",
            strokeWidth: "97%",
          },
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          shadeIntensity: 0.15,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 65, 91],
        },
      },
      stroke: {
        dashArray: 4,
      },
    },
  };

  return (
    <div className="w-full flex flex-col items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />

        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-4">
          <span className="text-xl font-black text-primaryTextColor">
            {"" === 1 ? "نتیجه تست روانشناسی نئو" : "تست طلاق عاطفی گاتمن"}
          </span>
          {/* result if exist */}
          {userTest?.total_score ? (
            <div className="w-full flex flex-col">
              <div className="w-full flex justify-center items-center bg-darkThemeColor h-14 rounded-t-2xl border border-borderColor">
                <h2 className="text-xl text-primaryTextColor font-bold">
                  امتیاز آزمون شما : {userTest?.total_score}
                </h2>
              </div>
              <div className="w-full flex flex-col gap-8 items-center border border-t-0 border-borderColor border-dashed rounded-b-2xl sm:p-5 p-3">
                <ChartResult chartData={userTest} />

                <div
                  dangerouslySetInnerHTML={{ __html: userTest.answer }}
                  className="text-primaryTextColor text-justify text-sm"
                ></div>
              </div>
            </div>
          ) : (
            <GottmanTest />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Page;

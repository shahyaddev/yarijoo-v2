import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import NeoTest from "./NeoTest";
import { cookies } from "next/headers";
import { baseURL } from "@/services/API";
import { toFarsiNumber } from "@/helper/helper";
import ChartResult from "./ChartResult";

const Page = async () => {
  const token = cookies().get("token")?.value;

  let userTest = null;
  try {
    const userTestRes = await fetch(`${baseURL}/tests/check-test`, {
      method: "POST",
      body: JSON.stringify({
        test: "neo",
      }),
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
    console.error("Error fetching neo test:", error);
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
            {userTest?.result ? "نتیجه تست روانشناسی نئو" : "تست نئو"}
          </span>

          {userTest?.result ? (
            userTest.result
              .sort((a, b) => b.total - a.total)
              .map((res, i) => (
                <div key={i} className="w-full flex flex-col">
                  <div className="w-full flex justify-center items-center bg-darkThemeColor h-14 rounded-t-2xl border border-borderColor">
                    <h2 className="text-xl text-primaryTextColor font-bold">
                      {res.title}
                    </h2>
                  </div>
                  {/* border border-t-0 border-dashed border-borderColor */}

                  <div className="w-full flex flex-col gap-8 items-center border border-t-0 border-borderColor border-dashed rounded-b-2xl sm:p-5 p-3">
                    <div className="w-full max-w-[400px] relative neo-chart md:-mt-10 -mt-5">
                      <ChartResult options={options} res={res} />

                      <span className="absolute text-primaryTextColor text-2xl font-black left-[60px] -bottom-4">
                        {toFarsiNumber(0)}
                      </span>

                      <span className="absolute text-primaryTextColor text-2xl font-black right-14 -bottom-4">
                        {toFarsiNumber(48)}
                      </span>

                      <div className="absolute text-primaryTextColor text-4xl md:text-6xl font-black left-2/4 -translate-x-2/4 top-[60%] -translate-y-2/4">
                        {toFarsiNumber(res.total > 48 ? 48 : res.total)}
                      </div>
                    </div>

                    <div
                      dangerouslySetInnerHTML={{ __html: res.description }}
                      className="text-secondaryTextColor text-right text-sm"
                    ></div>
                  </div>
                </div>
              ))
          ) : (
            <NeoTest />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Page;

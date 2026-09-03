"use client";

import { useUser } from "@/lib/useUser";
import { postData } from "@/services/API";
import { Spinner } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaStar } from "react-icons/fa";

const Rate = ({ rated, id, type = "product" }) => {
  const user = useUser();
  const [rate, setRate] = useState(null);
  const [rateSended, setRateSended] = useState(false);
  const [sendRate, setSendRate] = useState(false);
  const [rateLoading, setRateLoading] = useState(false);
  const [isRateSubmitted, setIsRateSubmitted] = useState(null);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    setIsRateSubmitted(rated);
  }, []);

  const rateOnchangeHandler = (length) => {
    setRate(length);
    setSendRate(true);
  };

  const sendRateHandler = () => {
    setRateLoading(true);

    // check user is login
    if (!user?.user?.id) {
      toast.error("ابتدا وارد حساب خود شوید", { duration: 4500 });
      setRateLoading(false);

      return null;
    }

    if (!rateSended) {
      postData(type === "product" ? "/shop/product/rate" : "/blog/post/rate", {
        number: rate,
        ...(type === "product" ? { product_id: id } : { post_id: id }),
      })
        .then((res) => {
          setSendRate(false);
          setRateSended(true);

          toast.success("امتیاز شما با موفقیت ثبت شد");
        })
        .catch((err) => {
          setRateLoading(false);

          toast.error("خطا هنگام ثبت امتیاز");
        });
    }
  };

  return (
    <div className="w-full md:max-h-14 flex flex-col-reverse md:flex-row gap-4 justify-between items-center p-4 bg-primaryThemeColor bg-opacity-15 rounded-xl">
      <Toaster />

      {isRateSubmitted ? (
        <span className="text-primaryTextColor">شما قبلا امتیاز داده اید</span>
      ) : sendRate ? (
        <div className="flex flex-col md:flex-row text-primaryTextColor items-center gap-4">
          <span>مطمنید میخواهید امتیاز شما ثبت شود ؟</span>

          <div className="flex items-center gap-4">
            <button
              onClick={sendRateHandler}
              className="text-sm text-success rounded-xl"
            >
              {rateLoading ? (
                <Spinner
                  size="sm"
                  classNames={{
                    circle1: "border-b-primaryThemeColor",
                    circle2: "border-b-primaryThemeColor",
                  }}
                />
              ) : (
                "بله ثبت امتیاز"
              )}
            </button>
            <button
              onClick={() => {
                setSendRate(false);
                setRate(null);
              }}
              className="text-red-600"
            >
              خیر
            </button>
          </div>
        </div>
      ) : rateSended ? (
        <span className="text-green-500">امتیاز شما ثبت شد</span>
      ) : (
        <span className="text-primaryTextColor">امتیاز شما</span>
      )}

      <div className="flex flex-row-reverse items-center gap-2">
        {Array.from({ length: 5 }, (_, index) => {
          const starValue = index + 1;
          return (
            <button
              disabled={rateSended || isRateSubmitted}
              key={starValue}
              type="button"
              onClick={() => rateOnchangeHandler(starValue)}
              onMouseEnter={() => setHover(starValue)}
              onMouseLeave={() => setHover(0)}
              className="focus:outline-none"
            >
              <FaStar
                size={18}
                className={`transition-colors ${
                  starValue <= (isRateSubmitted || hover || rate)
                    ? "text-primaryThemeColor"
                    : "text-primaryTextColor"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Rate;

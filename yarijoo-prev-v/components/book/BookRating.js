"use client";

import { useUser } from "@/lib/useUser";
import { postData } from "@/services/API";
import { Spinner } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaStar } from "react-icons/fa";
import { toFarsiNumber } from "@/helper/helper";

const BookRating = ({ bookId }) => {
  const user = useUser();
  const [rate, setRate] = useState(null);
  const [rateSended, setRateSended] = useState(false);
  const [sendRate, setSendRate] = useState(false);
  const [rateLoading, setRateLoading] = useState(false);
  const [isRateSubmitted, setIsRateSubmitted] = useState(false);
  const [hover, setHover] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [loadingRating, setLoadingRating] = useState(true);

  useEffect(() => {
    fetchRating();
  }, [bookId]);

  const fetchRating = async () => {
    try {
      setLoadingRating(true);
      const response = await postData(`/book/get-rating`, {
        book_id: bookId,
      }, null, false);

      if (response && response.data && response.data.average !== undefined) {
        setAverageRating(response.data.average);
        setRatingCount(response.data.count || 0);
        setIsRateSubmitted(response.data.user_rated || false);
      }
    } catch (error) {
      console.error("Error fetching rating:", error);
    } finally {
      setLoadingRating(false);
    }
  };

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
      postData("/book/rate", {
        number: rate,
        book_id: bookId,
      })
        .then((res) => {
          setSendRate(false);
          setRateSended(true);
          setIsRateSubmitted(true);
          toast.success("امتیاز شما با موفقیت ثبت شد");
          setRateLoading(false);
          // Refresh rating data
          fetchRating();
        })
        .catch((err) => {
          setRateLoading(false);
          if (err?.response?.data === 'already rated' || err?.response?.status === 400) {
            toast.error("شما قبلاً به این کتاب امتیاز داده‌اید");
            setIsRateSubmitted(true);
            fetchRating();
          } else {
            toast.error("خطا هنگام ثبت امتیاز");
          }
        });
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 p-6 bg-secondaryThemeColor rounded-2xl border border-borderColor/60">
      <Toaster />

      {/* Average Rating Display */}
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-black text-primaryTextColor">امتیاز کتاب</h3>
          {loadingRating ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span className="text-sm text-secondaryTextColor">در حال بارگذاری...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, index) => {
                  const starValue = index + 1;
                  return (
                    <FaStar
                      key={starValue}
                      size={20}
                      className={
                        starValue <= Math.round(averageRating)
                          ? "text-primaryThemeColor"
                          : "text-gray-400"
                      }
                    />
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-primaryThemeColor">
                  {averageRating > 0 ? toFarsiNumber(averageRating.toFixed(1)) : "۰"}
                </span>
                {ratingCount > 0 && (
                  <span className="text-sm text-secondaryTextColor">
                    ({toFarsiNumber(ratingCount)} امتیاز)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rating Input */}
      {isRateSubmitted ? (
        <div className="w-full p-4 bg-primaryThemeColor/10 rounded-xl border border-primaryThemeColor/20">
          <span className="text-primaryTextColor flex items-center gap-2">
            <i className="fi fi-rr-check-circle text-primaryThemeColor"></i>
            شما قبلاً به این کتاب امتیاز داده‌اید
          </span>
        </div>
      ) : sendRate ? (
        <div className="w-full flex flex-col md:flex-row gap-4 p-4 bg-darkThemeColor/50 rounded-xl border border-borderColor/40">
          <span className="text-primaryTextColor flex-1">مطمئن هستید می‌خواهید امتیاز شما ثبت شود؟</span>
          <div className="flex items-center gap-4">
            <button
              onClick={sendRateHandler}
              className="text-sm text-success rounded-xl px-4 py-2 hover:bg-success/10 transition-all"
              disabled={rateLoading}
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
                "بله، ثبت امتیاز"
              )}
            </button>
            <button
              onClick={() => {
                setSendRate(false);
                setRate(null);
              }}
              className="text-sm text-red-600 px-4 py-2 hover:bg-red-600/10 rounded-xl transition-all"
            >
              خیر
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-darkThemeColor/50 rounded-xl border border-borderColor/40">
          <span className="text-primaryTextColor">امتیاز شما</span>
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
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <FaStar
                    size={24}
                    className={`transition-colors ${
                      starValue <= (hover || rate)
                        ? "text-primaryThemeColor"
                        : "text-gray-400"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookRating;


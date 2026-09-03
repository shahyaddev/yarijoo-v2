"use client";

import { toFarsiNumber } from "@/helper/helper";
import { postData } from "@/services/API";
import React, { useEffect, useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";

const ResendTimer = ({ userInfo, min, sec, className }) => {
  const [minutes, setMinutes] = useState(min);
  const [seconds, setSeconds] = useState(sec);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  // همگام‌سازی state با props
  useEffect(() => {
    setMinutes(min);
    setSeconds(sec);
  }, [min, sec]);

  useEffect(() => {
    // توقف interval قبلی اگر وجود دارد
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // شروع interval جدید
    intervalRef.current = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds > 0) {
          return prevSeconds - 1;
        } else {
          // وقتی seconds به 0 می‌رسد
          setMinutes((prevMinutes) => {
            if (prevMinutes > 0) {
              return prevMinutes - 1;
            } else {
              // تایمر تمام شد
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              return 0;
            }
          });
          return 59;
        }
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // بررسی اگر تایمر تمام شد، interval را متوقف کن
  useEffect(() => {
    if (minutes === 0 && seconds === 0 && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [minutes, seconds]);

  const resendVerficationCode = () => {
    setLoading(true);

    postData("/user/auth", { phone_number: userInfo.phone_number })
      .then((res) => {
        setLoading(false);
        
        // توقف interval قبلی
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // تنظیم مجدد تایمر
        setMinutes(2);
        setSeconds(30);
        
        // شروع interval جدید
        intervalRef.current = setInterval(() => {
          setSeconds((prevSeconds) => {
            if (prevSeconds > 0) {
              return prevSeconds - 1;
            } else {
              setMinutes((prevMinutes) => {
                if (prevMinutes > 0) {
                  return prevMinutes - 1;
                } else {
                  if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                  }
                  return 0;
                }
              });
              return 59;
            }
          });
        }, 1000);
      })
      .catch((err) => {
        setLoading(false);

        toast.error(err.response?.data?.message || "خطا در ارسال کد تائید", {
          duration: 3000,
        });
      });
  };

  return (
    <div className={`flex items-center justify-center gap-2 py-2 pt-0 ${className || ""}`}>
      <Toaster />

      {minutes === 0 && seconds === 0 ? (
        <button
          onClick={resendVerficationCode}
          className="text-sm text-primaryThemeColor flex items-center gap-2"
        >
          <i
            className={`fi fi-rr-refresh text-base h-4 ${
              loading ? "animate-spinner-ease-spin" : ""
            }`}
          ></i>

          <span>ارسال مجدد کد تائید</span>
        </button>
      ) : (
        <span className="text-sm text-secondaryTextColor">
          {minutes < 10
            ? `${toFarsiNumber(0)}${toFarsiNumber(minutes)}`
            : toFarsiNumber(minutes)}
          :
          {seconds < 10
            ? `${toFarsiNumber(0)}${toFarsiNumber(seconds)}`
            : toFarsiNumber(seconds)}{" "}
          تا ارسال مجدد کد تائید
        </span>
      )}
    </div>
  );
};

export default ResendTimer;

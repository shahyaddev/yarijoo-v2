"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import CustomLoading from "@/components/shared/CustomLoading";

const ShopLoadingWrapper = ({ children }) => {
  const searchParams = useSearchParams();
  const [showLoading, setShowLoading] = useState(false);
  const previousParams = useRef(searchParams.toString());
  const timeoutRef = useRef(null);

  useEffect(() => {
    const currentParams = searchParams.toString();
    
    // اگر params تغییر کرد
    if (currentParams !== previousParams.current && previousParams.current !== "") {
      setShowLoading(true);
      
      // پاک کردن timeout قبلی
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // بعد از اینکه صفحه load شد، loading را hide کن
      timeoutRef.current = setTimeout(() => {
        setShowLoading(false);
      }, 400);
    }
    
    previousParams.current = currentParams;
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchParams]);

  return (
    <>
      <CustomLoading isLoading={showLoading} />
      {children}
    </>
  );
};

export default ShopLoadingWrapper;


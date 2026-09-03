"use client";
import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toFarsiNumber } from "@/helper/helper";

const ShopPagination = ({ currentPage, totalPages, totalProducts, perPage = 12 }) => {
  const router = useRouter();
  const isInitialMount = useRef(true);
  const prevPageRef = useRef(currentPage);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevPageRef.current = currentPage;
      return;
    }

    if (prevPageRef.current !== currentPage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      prevPageRef.current = currentPage;
    }
  }, [currentPage]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePageChange = (page) => {
    if (page !== currentPage && page !== '...') {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set('page', page);
      router.push(`/shop?${searchParams.toString()}`);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 mt-8">
      <div className="text-sm text-secondaryTextColor">
        نمایش {toFarsiNumber((currentPage - 1) * perPage + 1)} تا {toFarsiNumber(Math.min(currentPage * perPage, totalProducts))} از {toFarsiNumber(totalProducts)} محصول
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            currentPage === 1
              ? 'bg-secondaryThemeColor/50 text-secondaryTextColor cursor-not-allowed'
              : 'bg-secondaryThemeColor text-primaryTextColor hover:bg-primaryThemeColor hover:text-white border border-borderColor/60 hover:border-primaryThemeColor'
          }`}
        >
          <i className="fi fi-rr-angle-right h-4"></i>
        </button>

        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="w-10 h-10 flex items-center justify-center text-secondaryTextColor">
                ...
              </span>
            ) : (
              <button
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-primaryThemeColor to-primaryThemeColor/90 text-white shadow-lg shadow-primaryThemeColor/30'
                    : 'bg-secondaryThemeColor text-primaryTextColor hover:bg-primaryThemeColor/20 hover:text-primaryThemeColor border border-borderColor/60 hover:border-primaryThemeColor/50'
                }`}
              >
                {toFarsiNumber(page)}
              </button>
            )}
          </React.Fragment>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            currentPage === totalPages
              ? 'bg-secondaryThemeColor/50 text-secondaryTextColor cursor-not-allowed'
              : 'bg-secondaryThemeColor text-primaryTextColor hover:bg-primaryThemeColor hover:text-white border border-borderColor/60 hover:border-primaryThemeColor'
          }`}
        >
          <i className="fi fi-rr-angle-left h-4"></i>
        </button>
      </div>
    </div>
  );
};

export default ShopPagination;


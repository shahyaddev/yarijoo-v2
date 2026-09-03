"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { toFarsiNumber } from "@/helper/helper";

const BookPages = ({ data, initialPageIndex = 0 }) => {
  const [pages, setPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(initialPageIndex);
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(17);
  const topRef = useRef(null);

  // Set initial page from prop
  useEffect(() => {
    if (initialPageIndex >= 0 && initialPageIndex < data.length) {
      setCurrentPageIndex(initialPageIndex);
    }
  }, [initialPageIndex, data.length]);

  useEffect(() => {
    topRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [currentPageIndex]);

  const prevPageHandler = () => {
    if (currentPageIndex === 0) return;

    setCurrentPageIndex((prev) => prev - 1);
  };

  const nextPageHandler = () => {
    if (currentPageIndex === data.length - 1) return;

    setCurrentPageIndex((prev) => prev + 1);
  };

  const decreaseFontSizeHandler = () => {
    if (fontSize < 12) return;

    setFontSize((prev) => prev - 1);
  };

  const increaseFontSizeHandler = () => {
    if (fontSize > 24) return;

    setFontSize((prev) => prev + 1);
  };

  const currentPage = data[currentPageIndex];

  return (
    <div
      ref={topRef}
      className="w-full flex flex-col items-center min-h-screen bg-darkThemeColor"
    >
      {/* setting modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="sm"
        classNames={{ base: "bg-darkThemeColor" }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-primaryTextColor">
                اندازه فونت
              </ModalHeader>
              <ModalBody className="flex flex-col">
                {/* <span className="text-sm text-primaryTextColor">اندازه فونت</span> */}

                <div className="w-full grid grid-cols-3 gap-3">
                  <button
                    onClick={increaseFontSizeHandler}
                    className="w-full h-12 text-sm bg-primaryThemeColor rounded-2xl flex items-center justify-center text-darkThemeColor active:scale-90 transition-all duration-300 gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                        clipRule="evenodd"
                      />
                    </svg>

                    <span>افزایش</span>
                  </button>

                  <button
                    onClick={decreaseFontSizeHandler}
                    className="w-full h-12 text-sm bg-red-600 rounded-2xl flex items-center justify-center text-primaryTextColor active:scale-90 transition-all duration-300 gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3 10.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5h6Z"
                        clipRule="evenodd"
                      />
                    </svg>

                    <span>کاهش</span>
                  </button>

                  <button
                    onClick={() => setFontSize(17)}
                    className="w-full h-12 text-sm bg-gray-400 rounded-2xl flex items-center justify-center text-darkThemeColor active:scale-90 transition-all duration-300 gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z"
                        clipRule="evenodd"
                      />
                    </svg>

                    <span>پشفرض</span>
                  </button>
                </div>
              </ModalBody>
              <ModalFooter className="w-full flex justify-center">
                <Button color="danger" variant="light" onPress={onClose}>
                  بستن
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <div className="w-full flex justify-center px-4">
        <div className="w-full max-w-[1280px] flex h-16 items-center justify-between">
          <Link href={`/books/${data[0]?.book?.id}/${data[0]?.book?.slug}`}>
            <h2 className="text-primaryThemeColor min-w-fit">
              {currentPage?.book?.title}
            </h2>
          </Link>

          {/* pagination */}
          <div className="items-center gap-2 hidden lg:flex">
            {data.map((item, index) => (
              <button
                key={index}
                onClick={() => setCurrentPageIndex(index)}
                className={`min-w-10 h-10 rounded-md flex items-center justify-center text-sm font-bold transition-all ${
                  index === currentPageIndex
                    ? "bg-primaryThemeColor text-darkThemeColor"
                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                }`}
              >
                {toFarsiNumber(index + 1)}
              </button>
            ))}
          </div>

          {/* settings */}
          <button
            onClick={() => setIsOpen(true)}
            className="text-primaryThemeColor"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="w-full flex flex-col gap-4 items-center bg-secondaryThemeColor h-full pb-8 px-4">
        <h3 className="text-2xl w-full max-w-[1280px] text-center font-black text-primaryThemeColor mt-4 border-b-2 border-borderColor pb-4">
          {currentPage?.title}
        </h3>

        <div
          style={{ fontSize: `${fontSize}px` }}
          className="w-full flex flex-col gap-4 text-primaryTextColor leading-8 max-w-[1280px] text-justify"
          dangerouslySetInnerHTML={{ __html: currentPage?.content }}
        ></div>

        {/* paginate button */}
        <div className="w-full flex justify-center max-w-[960px] gap-4">
          <button
            onClick={prevPageHandler}
            className={`max-w-40 w-full flex justify-center items-center gap-2 text-gray-400 border-2 border-gray-400 h-14 rounded-2xl hover:opacity-80 transition-all duration-300 ${
              currentPageIndex === 0
                ? "invisible opacity-0"
                : "visible opacity-100"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm4.28 10.28a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 1 0-1.06 1.06l1.72 1.72H8.25a.75.75 0 0 0 0 1.5h5.69l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3Z"
                clipRule="evenodd"
              />
            </svg>

            <span>صفحه قبلی</span>
          </button>

          <button
            onClick={nextPageHandler}
            className={`max-w-96 w-full flex justify-center items-center gap-2 text-darkThemeColor bg-primaryThemeColor h-14 rounded-2xl hover:opacity-80 transition-all duration-300 ${
              currentPageIndex === data.length - 1
                ? "invisible opacity-0"
                : "visible opacity-100"
            }`}
          >
            <span>صفحه بعدی</span>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-4.28 9.22a.75.75 0 0 0 0 1.06l3 3a.75.75 0 1 0 1.06-1.06l-1.72-1.72h5.69a.75.75 0 0 0 0-1.5h-5.69l1.72-1.72a.75.75 0 0 0-1.06-1.06l-3 3Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookPages;

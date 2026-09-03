import React from "react";

const MessageItem = ({ data }) => {
  return (
    <div
      className={`w-full flex relative gap-3 ${
        data.role === "admin" ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div className="flex flex-col gap-2">
        {data.role === "admin" && (
          <div className="flex text-sm items-center text-secondaryTextColor gap-2">
            <i className="fi fi-rr-user-headset text-sm h-[14px]"></i>

            <span>پشتیبانی یاریجو</span>
          </div>
        )}

        {/* message with pdf */}
        {data.file?.slice(-3) === "pdf" && (
          <div
            className={`p-3 text-[15px] w-full xl:max-w-[385px] 2xl:max-w-[500px] relative ${
              data.role === "admin"
                ? "before:-left-3 bg-darkThemeColor text-primaryTextColor rounded-bl-none"
                : "text-darkThemeColor before:-right-3 bg-primaryThemeColor rounded-br-none"
            } w-fit h-fit rounded-2xl`}
          >
            <a
              target="_blank"
              href={`https://api.yarijoo.ir/${data.file}`}
              className={`w-48 mb-3 h-14 rounded-md ${
                data.role === "admin" ? "bg-gray-400" : "bg-indigo-50"
              } bg-opacity-20 flex justify-between items-center px-2`}
            >
              <span className="">برای دانلود کلیک کنید</span>
              <div
                className={`w-12 h-12 bg-gradient-to-bl ${
                  data.role === "admin"
                    ? "from-gray-300 to-gray-100"
                    : "from-[#2f52ef] to-[#8486ff]"
                } shadow-[inset_-4px_-4px_4px_-5px_#5d5d5d7a] rounded-full flex items-center justify-center`}
              >
                pdf
              </div>
            </a>
            <p className="break-words w-full">{data.message}</p>
          </div>
        )}

        {/* message with image */}
        {data.file && data.file.slice(-3) !== "pdf" && (
          <div
            className={` p-3 text-[15px] w-full xl:max-w-[385px] 2xl:max-w-[500px] relative ${
              data.role === "admin"
                ? "before:-left-3 bg-darkThemeColor rounded-bl-none text-primaryTextColor"
                : "text-darkThemeColor before:-right-3 bg-primaryThemeColor rounded-br-none"
            } w-fit h-fit rounded-2xl`}
          >
            <img
              src={`https://api.yarijoo.ir/${data.file}`}
              alt=""
              className="w-52 rounded-2xl mb-3 cursor-pointer"
              // onClick={showImage}
            />
            <p className="break-words w-full">{data.message}</p>
          </div>
        )}

        {!data.file && (
          <div
            className={` p-3 text-[15px] w-full xl:max-w-[385px] 2xl:max-w-[500px] relative ${
              data.role === "admin"
                ? "before:-left-3 bg-darkThemeColor rounded-bl-none text-primaryTextColor"
                : "text-darkThemeColor before:-right-3 bg-primaryThemeColor rounded-br-none"
            } w-fit h-fit rounded-2xl`}
          >
            <p className="break-words w-full">{data.message}</p>
          </div>
        )}

        <div
          className={`absolute bottom-0 ${
            data.role === "admin" ? "-scale-x-100 -left-4" : "-right-4"
          }`}
        >
          <div
            className={`msg-corner relative w-4 h-4 ${
              data.role === "admin" ? "bg-darkThemeColor" : "bg-primaryThemeColor"
            } `}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;

"use client";

import Comment from "@/components/shared/comment/Comment";
import SendComment from "@/components/shared/comment/SendComment";
import { toFarsiNumber } from "@/helper/helper";
import { Tab, Tabs } from "@nextui-org/react";
import React from "react";

const DescriptionComments = ({ product, comments }) => {
  return (
    <div className="w-full p-4 pt-0 bg-secondaryThemeColor rounded-2xl">
      <Tabs
        aria-label="منو تب"
        size="lg"
        className="!mt-3"
        classNames={{
          tabList: "!bg-secondaryThemeColor border border-borderColor",
          cursor: "!bg-primaryThemeColor",
        }}
      >
        <Tab
          key="product"
          title={
            <span className="text-primaryTextColor group-data-[selected=true]:text-darkThemeColor">
              معرفی محصول
            </span>
          }
        >
          <div className="w-full flex flex-col gap-2 mt-2">
            <div className="w-full flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="size-1 rounded-full bg-primaryThemeColor"></span>
                <span className="size-2 rounded-full bg-primaryThemeColor"></span>
              </div>

              <span className="text-lg text-primaryTextColor font-black">
                معرفی محصول
              </span>
            </div>

            <div
              dangerouslySetInnerHTML={{ __html: product.description }}
              className="text-base text-secondaryTextColor leading-7 text-justify"
            ></div>
          </div>
        </Tab>

        <Tab
          key="comment"
          title={
            <span className="text-primaryTextColor group-data-[selected=true]:text-darkThemeColor">
              دیدگاه کاربران
            </span>
          }
        >
          <div className="w-full flex flex-col gap-2 mt-2">
            <div className="w-full flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="size-1 rounded-full bg-primaryThemeColor"></span>
                <span className="size-2 rounded-full bg-primaryThemeColor"></span>
              </div>

              <span className="text-lg text-primaryTextColor font-black">
                دیدگاه شما
              </span>
            </div>

            <SendComment id={product?.id} />
          </div>

          <div className="w-full flex flex-col gap-3 mt-4">
            <div className="w-full flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="size-1 rounded-full bg-primaryThemeColor"></span>
                <span className="size-2 rounded-full bg-primaryThemeColor"></span>
              </div>

              <div className="text-lg flex items-center gap-2 text-primaryTextColor font-black">
                <span>دیدگاه کاربران</span>
                <span className="font-normal text-sm text-secondaryTextColor">
                  ({toFarsiNumber(comments?.comments?.length)} دیدگاه)
                </span>
              </div>
            </div>

            <div className="flex flex-col text-secondaryTextColor gap-3">
              {comments?.comments?.length
                ? comments?.comments?.map((comment) => (
                    <Comment
                      id={product?.id}
                      data={comment}
                      className="bg-secondaryThemeColor border border-borderColor"
                      replyClassName="!bg-darkThemeColor"
                    />
                  ))
                : "دیدگاهی برای این محصول وجود ندارد !"}
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default DescriptionComments;

"use client";

import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Textarea } from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import { postData } from "@/services/API";
import { useUser } from "@/lib/useUser";

const SendComment = ({
  id,
  reply,
  userReplyInfo,
  comment_id,
  setOpen,
  type = "product",
}) => {
  const [loading, setLoading] = useState(false);
  const user = useUser();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      message: "",
    },
  });

  const sendCommentHandler = (data) => {
    if (user?.user?.id) {
      setLoading(true);

      const endpoint = 
        type === "product" 
          ? "/shop/comment/save" 
          : type === "book"
          ? `/book/books/${id}/comments`
          : "/blog/post/comment/save";
      
      const body = 
        type === "book"
          ? {
              body: data.message,
              ...(reply && { parent_id: comment_id }),
              ...(data.title && { title: data.title }),
              ...(data.rating && { rating: data.rating }),
            }
          : {
              ...data,
              ...(reply && { parent_id: comment_id }),
              ...(type === "product" ? { product_id: id } : { post_id: id }),
            };

      postData(endpoint, body)
        .then((res) => {
          reply &&
            setTimeout(() => {
              setOpen(false);
            }, 3000);

          setValue("message", "");
          setLoading(false);

          toast.success(
            "دیدگاه شما موفقیت ثبت شد و پس از تایید مدیریت منتشر میشود",
            { duration: 4500 }
          );
        })
        .catch((err) => {
          setLoading(false);

          toast.error(err?.response?.data?.message || "خطا هنگام ثبت دیدگاه", {
            duration: 4500,
          });
        });
    } else {
      toast.error("ابتدا وارد حساب خود شوید", { duration: 4500 });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Toaster />

      {reply && (
        <div className="flex items-center gap-2">
          <h3 className="text-lg text-primaryTextColor font-black">{`پاسخ به ${
            userReplyInfo.name + " " + userReplyInfo.family_name
          }`}</h3>
        </div>
      )}

      <Controller
        name="message"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <Textarea
            type="text"
            label="دیدگاه شما"
            placeholder="دیدگاه خود را بنویسید"
            variant="bordered"
            value={value}
            onBlur={onBlur}
            onChange={onChange}
            labelPlacement="outside"
            classNames={{
              label: "!text-primaryTextColor",
              inputWrapper:
                "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
            }}
            isInvalid={errors.message ? true : false}
            errorMessage="متن دیدگاه اجباری میباشد"
            {...register("message", { required: true })}
          />
        )}
      />

      <Button
        isLoading={loading}
        onClick={handleSubmit(sendCommentHandler)}
        className="bg-primaryThemeColor text-secondaryThemeColor w-full h-11 rounded-2xl transition-all duration-300"
      >
        <span>ثبت دیدگاه</span>
      </Button>
    </div>
  );
};

export default SendComment;

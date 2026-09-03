"use client";

import { postData } from "@/services/API";
import { Input, Spinner } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";

const SendTicketMessage = ({ ticketId }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      message: "",
    },
  });

  const sendMessageHandler = (data) => {
    setLoading(true);

    postData(
      `/ticket/message/save`,
      {
        ticket_id: ticketId,
        ...data,
        // file: image,
      },
      true
    )
      .then((res) => {
        setLoading(false);
        setValue("message", "");
        router.refresh();
      })

      .catch((err) => {
        toast.error("خطا هنگام ارسال پیام");
        setLoading(false);
      });
  };

  return (
    <div className="w-full flex items-center gap-3">
      <Toaster />

      <Controller
        name="message"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Input
            type="text"
            placeholder="پیام خود را وارد کنید"
            variant="bordered"
            labelPlacement="outside"
            value={value}
            onChange={onChange}
            classNames={{
              label: "!text-primaryTextColor",
              inputWrapper:
                "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
            }}
            isInvalid={errors.message ? true : false}
            // errorMessage="پیام شما اجباری میباشد"
            {...register("message", { required: true })}
          />
        )}
      />

      <button
        onClick={handleSubmit(sendMessageHandler)}
        className="min-w-12 size-12 rounded-2xl text-darkThemeColor bg-primaryThemeColor flex justify-center items-center"
      >
        {loading ? (
          <Spinner size="sm" color="white" />
        ) : (
          <i className="fi fi-rr-paper-plane text-2xl h-6"></i>
        )}
      </button>
    </div>
  );
};

export default SendTicketMessage;

"use client";

import { Input, Textarea } from "@nextui-org/react";
import React from "react";
import { useForm } from "react-hook-form";

const ContactUsForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      name: "",
      phone_number: "",
      message: "",
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <Input
        label="نام و نام خانوادگی"
        placeholder="نام و نام خانوادگی خود را وارد کنید"
        variant="bordered"
        labelPlacement="outside"
        classNames={{
          label: "!text-primaryTextColor",
          inputWrapper:
            "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
        }}
        isInvalid={errors.password ? true : false}
        errorMessage="نام و نام خانوادگی اجباری میباشد"
        {...register("password", { required: true })}
      />

      <Input
        type="text"
        label="شماره تلفن"
        placeholder="شماره تلفن خود را وارد کنید"
        variant="bordered"
        labelPlacement="outside"
        classNames={{
          label: "!text-primaryTextColor",
          inputWrapper:
            "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
        }}
        isInvalid={errors.phone_number ? true : false}
        errorMessage={errors?.phone_number?.message}
        {...register("phone_number", {
          validate: {
            isRequired: (value) =>
              value.length > 0 || "شماره تلفن اجباری میباشد",
            isNumber: (value) =>
              /^[0-9\b]+$/.test(value) || "فرمت شماره تلفن صحیح نمیباشد",
          },
        })}
      />

      <Textarea
        label="پیام شما"
        placeholder="پیام خود را وارد کنید"
        variant="bordered"
        labelPlacement="outside"
        classNames={{
          label: "!text-primaryTextColor",
          input: "",
          inputWrapper:
            "border !h-40 border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
        }}
        isInvalid={errors.message ? true : false}
        errorMessage="پیام اجباری میباشد"
        {...register("message", { required: true })}
      />

      <button className="bg-primaryThemeColor text-primaryTextColor w-full h-11 rounded-2xl transition-all duration-300">
        <span>ارسال</span>
      </button>
    </div>
  );
};

export default ContactUsForm;

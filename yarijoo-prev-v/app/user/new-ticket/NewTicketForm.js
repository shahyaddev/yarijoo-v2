"use client";

import { getFileSize, toFarsiNumber } from "@/helper/helper";
import { postData } from "@/services/API";
import { Button, Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaCloudUploadAlt } from "react-icons/fa";

const NewTicketForm = () => {
  const [loading, setLoading] = useState(false);

  const categories = [
    { name: "پشتیبانی", id: "0" },
    { name: "مدیریت", id: "1" },
    { name: "فروش", id: "2" },
  ];

  const priorities = [
    { name: "اولویت کم", id: "low" },
    { name: "اولویت متوسط", id: "medium" },
    { name: "اولویت زیاد", id: "high" },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      title: "",
      message: "",
      priority: "",
      category_id: "",
      file: "",
    },
  });

  const submitNewTicketHandler = (data) => {
    setLoading(true);

    const formData = {
      title: data.title,
      message: data.message,
      priority: data.priority,
      category_id: data.category_id,
    };

    // اضافه کردن فایل فقط در صورت وجود
    if (data.file && data.file[0]) {
      formData.file = data.file[0];
    }

    postData("/ticket/save", formData, "multipart")
      .then((res) => {
        setLoading(false);

        reset({
          title: "",
          message: "",
          priority: "",
          category_id: "",
          file: "",
        });

        toast.success("تیکت شما با موفقیت ارسال شد", { duration: 4000 });
      })
      .catch((err) => {
        setLoading(false);
        toast.error("خطا هنگام ارسال تیکت", { duration: 4000 });
      });
  };

  const fileInput = watch("file");
  const image = fileInput && fileInput[0] ? fileInput[0] : null;
  const imageUrl = image && URL.createObjectURL(image);
  const imageSize = image && getFileSize(image.size);

  return (
    <div className="w-full flex flex-col gap-6">
      <Input
        type="text"
        label="موضوع"
        placeholder="موضوع تیکت را وارد کنید"
        variant="bordered"
        labelPlacement="outside"
        classNames={{
          label: "!text-primaryTextColor",
          inputWrapper:
            "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
        }}
        isInvalid={errors.title ? true : false}
        errorMessage="موضوع تیکت اجباری میباشد"
        {...register("title", { required: true })}
      />

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 place-content-start items-start">
        <Controller
          name="category_id"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Select
              variant="bordered"
              required
              label={
                <>
                  <span>دپارتمان پشتیبانی</span>
                </>
              }
              labelPlacement="outside"
              size="md"
              // value={watch("gender")}
              selectedKeys={value ? [value] : []}
              onBlur={onBlur}
              onChange={onChange}
              isInvalid={errors.category_id ? true : false}
              errorMessage="انتخاب دپارتمان اجباری میباشد"
              placeholder="دپارتمان خود را انتخاب کنید"
              classNames={{
                input: "placeholder:!text-xs",
                value:"!text-primaryTextColor",
                trigger:
                  "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
              }}
              {...register("category_id", { required: true })}
            >
              {categories.map((category) => (
                <SelectItem key={category.id}>{category.name}</SelectItem>
              ))}
            </Select>
          )}
        />

        <Controller
          name="priority"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Select
              variant="bordered"
              required
              label={
                <>
                  <span>اولویت تیکت</span>
                </>
              }
              labelPlacement="outside"
              size="md"
              selectedKeys={value ? [value] : []}
              onBlur={onBlur}
              onChange={onChange}
              isInvalid={errors.priority ? true : false}
              errorMessage="اولویت اجباری میباشد"
              placeholder="اولویت تیکت خود را انتخاب کنید"
              classNames={{
                input: "placeholder:!text-xs",
                value:"!text-primaryTextColor",
                trigger:
                  "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
              }}
              {...register("priority", { required: true })}
            >
              {priorities.map((priority) => (
                <SelectItem key={priority.id}>{priority.name}</SelectItem>
              ))}
            </Select>
          )}
        />
      </div>

      <Textarea
        type="text"
        label="پیام شما"
        placeholder="پیام خود را وارد کنید"
        variant="bordered"
        labelPlacement="outside"
        minRows={6}
        classNames={{
          label: "!text-primaryTextColor",
          input: "!text-primaryTextColor",
          inputWrapper:
            "border border-borderColor focus-within:!border-primaryThemeColor/50 !shadow-none bg-darkThemeColor",
        }}
        isInvalid={errors.message ? true : false}
        errorMessage="پیام شما اجباری میباشد"
        {...register("message", { required: true })}
      />

      {/* File Upload */}
      <div className="w-full flex flex-col gap-2">
        <label className="text-sm font-medium text-primaryTextColor text-center">
          پیوست (اختیاری)
        </label>
        <div className="w-full relative group border-2 border-dashed border-borderColor hover:border-primaryThemeColor/50 transition-all duration-300 rounded-2xl bg-darkThemeColor/50">
          {/* Content */}
          <div className="w-full min-h-[192px] flex flex-col gap-4 items-center justify-center text-center p-6">
            <FaCloudUploadAlt className="size-12 md:size-16 text-secondaryTextColor group-hover:text-primaryThemeColor group-hover:-translate-y-2 transition-all duration-300 shrink-0" />

            <div className="flex flex-col items-center justify-center gap-1.5 w-full max-w-md mx-auto">
              <span className="text-sm md:text-base text-secondaryTextColor font-medium text-center leading-relaxed">
                فایل را اینجا رها کنید یا برای انتخاب کلیک کنید
              </span>
              <p className="text-xs text-secondaryTextColor/70 text-center">
                فرمت‌های مجاز: تصویر، PDF (حداکثر 5 مگابایت)
              </p>
            </div>
          </div>

          {/* File Input Overlay */}
          <Input
            classNames={{
              helperWrapper: "hidden",
              inputWrapper:
                "absolute inset-0 h-full opacity-0 w-full z-50 cursor-pointer",
              input: "w-full h-full cursor-pointer",
            }}
            type="file"
            accept="image/*,.pdf"
            isInvalid={errors.file ? true : false}
            {...register("file", { required: false })}
          />
        </div>
        {errors.file && (
          <p className="text-xs text-danger">{errors.file.message}</p>
        )}
      </div>

      {/* Preview Uploaded File */}
      {image?.name && (
        <div className="w-full flex justify-between items-center border border-borderColor bg-darkThemeColor p-4 rounded-xl gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {image.type?.startsWith('image/') && (
              <img 
                src={imageUrl} 
                className="w-16 h-16 rounded-lg object-cover shrink-0" 
                alt={image.name} 
              />
            )}
            {image.type === 'application/pdf' && (
              <div className="w-16 h-16 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                <i className="fi fi-rr-file-pdf text-2xl text-red-400"></i>
              </div>
            )}

            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <span className="text-sm font-medium text-primaryTextColor truncate">
                {image.name}
              </span>
              <span className="text-xs text-secondaryTextColor">
                {toFarsiNumber(imageSize)}
              </span>
            </div>
          </div>

          <button 
            onClick={() => setValue("file", "")}
            className="size-10 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 flex items-center justify-center transition-colors shrink-0"
            type="button"
            aria-label="حذف فایل"
          >
            <i className="fi fi-rr-cross-small text-lg"></i>
          </button>
        </div>
      )}

      <Button
        isLoading={loading}
        onClick={handleSubmit(submitNewTicketHandler)}
        className="bg-primaryThemeColor text-darkThemeColor w-full max-w-md mx-auto h-12 rounded-2xl font-bold text-base transition-all duration-300 hover:shadow-lg hover:shadow-primaryThemeColor/20"
        size="lg"
      >
        {loading ? "در حال ارسال..." : "ارسال تیکت"}
      </Button>
    </div>
  );
};

export default NewTicketForm;

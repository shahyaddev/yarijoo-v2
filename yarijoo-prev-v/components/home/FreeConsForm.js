"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input, Button, Textarea, Select, SelectItem } from "@nextui-org/react";
import { postData } from "@/services/API";
import toast from "react-hot-toast";
import Discussion from "./animations/Discussion";

const FreeConsForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      full_name: "",
      consultation_type: "",
      contact_method: "",
      problem_description: "",
      preference: "",
      weekly_time: "",
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // ارسال داده‌ها به API
      await postData("/consultation/evaluation", data, null, false);
      toast.success("فرم ارزیابی شما با موفقیت ارسال شد!");
      reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("خطا در ارسال فرم. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 p-6 h-auto mt-12 relative overflow-hidden">
      <h2 className="md:text-4xl text-3xl font-black text-primaryThemeColor">
        فرم ارزیابی مشاوره
      </h2>

      <p className="text-center max-w-[800px] text-lg font-light text-primaryTextColor">
        در این بخش، می‌توانید فرم ارزیابی مشاوره را پر کنید تا ما بتوانیم بهترین
        خدمات را به شما ارائه دهیم.
      </p>

      <div className="w-full grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* بخش انیمیشن */}
        <div className="w-full lg:col-span-3 flex justify-center items-center order-2 lg:order-1">
          <Discussion />
        </div>

        {/* بخش فرم */}
        <div className="w-full lg:col-span-3 order-1 lg:order-2">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-4"
          >
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-start gap-4">
              {/* نام و نام خانوادگی */}
              <Controller
                name="full_name"
                control={control}
                rules={{ required: "نام و نام خانوادگی الزامی است" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="نام و نام خانوادگی"
                    placeholder="نام و نام خانوادگی خود را وارد کنید"
                    variant="bordered"
                    labelPlacement="outside"
                    isInvalid={!!errors.full_name}
                    errorMessage={errors.full_name?.message}
                    classNames={{
                      label: "!text-primaryTextColor",
                      inputWrapper:
                        "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
                    }}
                  />
                )}
              />

              {/* نوع مشاوره */}
              <Controller
                name="consultation_type"
                control={control}
                rules={{ required: "لطفاً نوع مشاوره را انتخاب کنید" }}
                render={({ field }) => (
                  <Select
                    selectedKeys={field.value ? [field.value] : []}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0];
                      field.onChange(selectedKey || "");
                    }}
                    label="نوع مشاوره"
                    placeholder="نوع مشاوره مورد نظر خود را انتخاب کنید"
                    variant="bordered"
                    labelPlacement="outside"
                    isInvalid={!!errors.consultation_type}
                    errorMessage={errors.consultation_type?.message}
                    classNames={{
                      label: "!text-primaryTextColor",
                      trigger:
                        "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
                      value: "!text-primaryTextColor",
                      popoverContent:
                        "bg-darkThemeColor border border-borderColor/70",
                      selectorIcon: "text-primaryTextColor",
                    }}
                    listboxProps={{
                      itemClasses: {
                        base: "!text-primaryTextColor !bg-transparent data-[hover=true]:!bg-primaryThemeColor/10 data-[selectable=true]:focus:!bg-primaryThemeColor/10 data-[selected=true]:!bg-primaryThemeColor/20 data-[selected=true]:!text-primaryThemeColor data-[hover=true]:!text-primaryTextColor",
                      },
                    }}
                    popoverProps={{
                      classNames: {
                        content:
                          "bg-darkThemeColor border border-borderColor/70",
                      },
                    }}
                  >
                    <SelectItem key="individual">مشاوره فردی</SelectItem>
                    <SelectItem key="couple">مشاوره زوجین</SelectItem>
                    <SelectItem key="family">مشاوره خانواده</SelectItem>
                    <SelectItem key="child">مشاوره کودک و نوجوان</SelectItem>
                    <SelectItem key="career">مشاوره شغلی</SelectItem>
                    <SelectItem key="other">سایر</SelectItem>
                  </Select>
                )}
              />
            </div>

            {/* ردیف دوم: روش تماس */}
            <Controller
              name="contact_method"
              control={control}
              rules={{ required: "لطفاً روش تماس ترجیحی خود را انتخاب کنید" }}
              render={({ field }) => (
                <Select
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0];
                    field.onChange(selectedKey || "");
                  }}
                  label="روش تماس ترجیحی"
                  placeholder="دوست دارید از چه طریقی با شما تماس گرفته شود؟"
                  variant="bordered"
                  labelPlacement="outside"
                  isInvalid={!!errors.contact_method}
                  errorMessage={errors.contact_method?.message}
                  classNames={{
                    label: "!text-primaryTextColor",
                    trigger:
                      "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
                    value: "!text-primaryTextColor",
                    popoverContent:
                      "bg-darkThemeColor border border-borderColor/70",
                    selectorIcon: "text-primaryTextColor",
                  }}
                  listboxProps={{
                    itemClasses: {
                      base: "!text-primaryTextColor !bg-transparent data-[hover=true]:!bg-primaryThemeColor/10 data-[selectable=true]:focus:!bg-primaryThemeColor/10 data-[selected=true]:!bg-primaryThemeColor/20 data-[selected=true]:!text-primaryThemeColor data-[hover=true]:!text-primaryTextColor",
                    },
                  }}
                  popoverProps={{
                    classNames: {
                      content: "bg-darkThemeColor border border-borderColor/70",
                    },
                  }}
                >
                  <SelectItem key="phone">تماس تلفنی</SelectItem>
                  <SelectItem key="whatsapp">واتساپ</SelectItem>
                  <SelectItem key="email">ایمیل</SelectItem>
                  <SelectItem key="sms">پیامک</SelectItem>
                  <SelectItem key="telegram">تلگرام</SelectItem>
                </Select>
              )}
            />

            {/* مشکل/نگرانی */}
            <Controller
              name="problem_description"
              control={control}
              rules={{ required: "لطفاً مشکل یا نگرانی خود را توضیح دهید" }}
              render={({ field }) => (
                <Textarea
                  {...field}
                  label="مشکل یا نگرانی شما"
                  placeholder="مشکل یا نگرانی خود را به صورت کامل توضیح دهید..."
                  variant="bordered"
                  labelPlacement="outside"
                  minRows={4}
                  isInvalid={!!errors.problem_description}
                  errorMessage={errors.problem_description?.message}
                  classNames={{
                    label: "!text-primaryTextColor",
                    inputWrapper:
                      "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
                  }}
                />
              )}
            />

            {/* ترجیح شما */}
            <Controller
              name="preference"
              control={control}
              rules={{ required: "لطفاً گزینه مورد نظر خود را انتخاب کنید" }}
              render={({ field }) => (
                <Select
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0];
                    field.onChange(selectedKey || "");
                  }}
                  label="ترجیح شما"
                  placeholder="دوست دارید با مشاور صحبت کنید یا راهکار دریافت کنید؟"
                  variant="bordered"
                  labelPlacement="outside"
                  isInvalid={!!errors.preference}
                  errorMessage={errors.preference?.message}
                  classNames={{
                    label: "!text-primaryTextColor",
                    trigger:
                      "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
                    value: "!text-primaryTextColor",
                    popoverContent:
                      "bg-darkThemeColor border border-borderColor/70",
                    selectorIcon: "text-primaryTextColor",
                  }}
                  listboxProps={{
                    itemClasses: {
                      base: "!text-primaryTextColor !bg-transparent data-[hover=true]:!bg-primaryThemeColor/10 data-[selectable=true]:focus:!bg-primaryThemeColor/10 data-[selected=true]:!bg-primaryThemeColor/20 data-[selected=true]:!text-primaryThemeColor data-[hover=true]:!text-primaryTextColor",
                    },
                  }}
                  popoverProps={{
                    classNames: {
                      content: "bg-darkThemeColor border border-borderColor/70",
                    },
                  }}
                >
                  <SelectItem key="talk">
                    دوست دارم با مشاور صحبت کنم
                  </SelectItem>
                  <SelectItem key="solution">
                    دوست دارم راهکار دریافت کنم
                  </SelectItem>
                  <SelectItem key="both">هر دو مورد</SelectItem>
                </Select>
              )}
            />

            {/* زمان آزاد در هفته */}
            <Controller
              name="weekly_time"
              control={control}
              rules={{ required: "لطفاً زمان آزاد خود در هفته را مشخص کنید" }}
              render={({ field }) => (
                <Select
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0];
                    field.onChange(selectedKey || "");
                  }}
                  label="زمان آزاد در هفته"
                  placeholder="چقدر در هفته تایم برای مشاوره دارید؟"
                  variant="bordered"
                  labelPlacement="outside"
                  isInvalid={!!errors.weekly_time}
                  errorMessage={errors.weekly_time?.message}
                  classNames={{
                    label: "!text-primaryTextColor",
                    trigger:
                      "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
                    value: "!text-primaryTextColor",
                    popoverContent:
                      "bg-darkThemeColor border border-borderColor/70",
                    selectorIcon: "text-primaryTextColor",
                  }}
                  listboxProps={{
                    itemClasses: {
                      base: "!text-primaryTextColor !bg-transparent data-[hover=true]:!bg-primaryThemeColor/10 data-[selectable=true]:focus:!bg-primaryThemeColor/10 data-[selected=true]:!bg-primaryThemeColor/20 data-[selected=true]:!text-primaryThemeColor data-[hover=true]:!text-primaryTextColor",
                    },
                  }}
                  popoverProps={{
                    classNames: {
                      content: "bg-darkThemeColor border border-borderColor/70",
                    },
                  }}
                >
                  <SelectItem key="1-2">1-2 ساعت در هفته</SelectItem>
                  <SelectItem key="3-5">3-5 ساعت در هفته</SelectItem>
                  <SelectItem key="5-10">5-10 ساعت در هفته</SelectItem>
                  <SelectItem key="10+">بیشتر از 10 ساعت در هفته</SelectItem>
                  <SelectItem key="flexible">منعطف هستم</SelectItem>
                </Select>
              )}
            />

            {/* دکمه ارسال */}
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="bg-primaryThemeColor text-darkThemeColor w-full h-11 rounded-2xl transition-all duration-300 font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "در حال ارسال..." : "ارسال فرم ارزیابی"}
            </Button>
          </form>
        </div>
      </div>

      <span className="anim-border-1"></span>
      <span className="anim-border-2"></span>
      <span className="anim-border-3"></span>
      <span className="anim-border-4"></span>
    </div>
  );
};

export default FreeConsForm;

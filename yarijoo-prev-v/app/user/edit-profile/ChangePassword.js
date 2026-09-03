"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { postData } from "@/services/API";
import toast from "react-hot-toast";

const ChangePassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const showPasswordToggle = () => setShowPassword(!showPassword);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      password: "",
    },
  });

  const changePasswordHanler = (data) => {
    setLoading(true);

    postData("/user/update-password", { new_password: data.password })
      .then((res) => {
        setLoading(false);

        toast.success("رمز عبور با موفقیت ویرایش شد");
      })
      .catch((err) => {
        setLoading(false);
        setError("password", {
          message:
            err?.response?.data?.new_password[0] ||
            "خطا هنگام دریافت پاسخ از سرور",
        });
        toast.error("خطا هنگام تغییر رمز عبور");
      });
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <Input
        label="رمز عبور جدید"
        placeholder="رمز عبور جدید خود را وارد کنید"
        variant="bordered"
        labelPlacement="outside"
        classNames={{
          label: "!text-primaryTextColor",
          inputWrapper:
            "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
        }}
        endContent={
          <button
            className="focus:outline-none"
            type="button"
            onClick={showPasswordToggle}
            aria-label="toggle password visibility"
          >
            {showPassword ? (
              <FaEyeSlash className="size-5 text-secondaryGrayColor pointer-events-none" />
            ) : (
              <FaEye className="size-5 text-secondaryGrayColor pointer-events-none" />
            )}
          </button>
        }
        type={showPassword ? "text" : "password"}
        isInvalid={errors.password ? true : false}
        errorMessage={errors?.password?.message}
        {...register("password", {
          validate: {
            isRequired: (value) => value.length > 0 || "رمز عبور اجباری میباشد",
            isSixLength: (value) =>
              value.length > 6 || "رمز عبور باید حداقل شش رقم باشد",
            isLowercase: (value) =>
              /[a-z]/g.test(value) || "رمز عبور شما باید شامل حروف کوچک باشد",
            isUppercase: (value) =>
              /[A-Z]/g.test(value) || "رمز عبور شما باید شامل حروف بزرگ باشد",
          },
        })}
      />

      <div className="w-full flex justify-center items-center">
        <Button
          isLoading={loading}
          onClick={handleSubmit(changePasswordHanler)}
          className="bg-primaryThemeColor text-darkThemeColor w-full max-w-96 h-11 rounded-2xl transition-all duration-300"
        >
          <span>تغییر رمز عبور</span>
        </Button>
      </div>
    </div>
  );
};

export default ChangePassword;

import { toFarsiNumber } from "@/helper/helper";
import { saveSession } from "@/lib/storage";
import { postData } from "@/services/API";
import { useUserStore } from "@/store/UserInfo";
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const CompleteRegister = ({ userInfo, setUserInfo, step, setStep }) => {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      name: "",
      family_name: "",
      gender: "1",
      password: "",
    },
  });

  const genders = [
    { name: "مرد", id: 1 },
    { name: "زن", id: 0 },
    { name: "دیگر", id: 2 },
  ];

  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const helPassword = ["رمز عبور باید حداقل شش رقم باشد", "رمز عبور باید", ""];

  const router = useRouter();

  const completeRegisterHandler = (data) => {
    setLoading(true);

    postData("/user/register", { ...userInfo, ...data })
      .then((res) => {
        // navigate user to dashboard
        toast.success("ثبت نام با موفقیت انجام شد، درحال انتقال...", {
          duration: 3000,
        });

        // set user info after regsiter is comnplete
        setUserInfo(data);

        // save token in cookie
        saveSession(res.data.token);

        localStorage.setItem("token", res.data.token);

        setUser(res.data.userinfo);

        setTimeout(() => {
          router.push("/user");
        }, 200);
      })
      .catch((err) => {
        setLoading(false);

        toast.error(err.response.data.message, {
          duration: 3000,
        });
      });
  };

  const showPasswordToggle = () => setShowPassword(!showPassword);

  return (
    <div className="w-full flex flex-col gap-3">
      <Toaster />

      <Input
        type="text"
        label="نام"
        placeholder="نام خود را وارد کنید"
        variant="bordered"
        labelPlacement="outside"
        classNames={{
          label: "!text-primaryTextColor",
          inputWrapper:
            "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
        }}
        isInvalid={errors.name ? true : false}
        errorMessage="نام اجباری میباشد"
        {...register("name", { required: true })}
      />

      <Input
        type="text"
        label="نام خانوادگی"
        placeholder="نام خانوادگی خود را وارد کنید"
        variant="bordered"
        labelPlacement="outside"
        classNames={{
          label: "!text-primaryTextColor",
          inputWrapper:
            "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
        }}
        isInvalid={errors.family_name ? true : false}
        errorMessage="نام خانوادگی اجباری میباشد"
        {...register("family_name", { required: true })}
      />

      <Controller
        name="gender"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <Select
            variant="bordered"
            required
            label={
              <>
                <span>جنسیت</span>
              </>
            }
            labelPlacement="outside"
            size="md"
            // value={watch("gender")}
            selectedKeys={value ? [value] : []}
            onBlur={onBlur}
            onChange={onChange}
            isInvalid={errors.gender ? true : false}
            errorMessage="انتخاب جنسیت اجباری میباشد"
            placeholder="جنسیت خود را انتخاب کنید"
            classNames={{
              value:"!text-primaryTextColor",
              input: "placeholder:!text-xs",
              trigger:
                "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
            }}
            {...register("gender", { required: true })}
          >
            {genders.map((gender) => (
              <SelectItem key={gender.id}>{gender.name}</SelectItem>
            ))}
          </Select>
        )}
      />

      <div className="flex flex-col gap-1">
        <Input
          label="رمز عبور"
          placeholder="رمز عبور خود را وارد کنید"
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
              isRequired: (value) =>
                value.length > 0 || "رمز عبور اجباری میباشد",
              isSixLength: (value) =>
                value.length > 6 || "رمز عبور باید حداقل شش رقم باشد",
              isLowercase: (value) =>
                /[a-z]/g.test(value) || "رمز عبور شما باید شامل حروف کوچک باشد",
              isUppercase: (value) =>
                /[A-Z]/g.test(value) || "رمز عبور شما باید شامل حروف بزرگ باشد",
            },
          })}
        />

        <span className="text-tiny text-secondaryTextColor">
          رمز عبور باید حداقل شش رقم و شامل اعداد، حروف انگلیسی بزرگ و کوچک
          باشد.
        </span>
      </div>

      <Button
        isLoading={loading}
        onClick={handleSubmit(completeRegisterHandler)}
        className="bg-primaryThemeColor w-full text-secondaryThemeColor !shadow-lg" 
        variant="shadow"
      >
        تکمیل ثبت نام
      </Button>
    </div>
  );
};

export default CompleteRegister;

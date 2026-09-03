import { toFarsiNumber } from "@/helper/helper";
import { saveSession } from "@/lib/storage";
import { postData } from "@/services/API";
import { useUserStore } from "@/store/UserInfo";
import { Button, Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { TbEditCircle } from "react-icons/tb";

const PasswordRecoverySubmit = ({ userInfo, setUserInfo, step, setStep }) => {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      vcode: "",
      password: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, setUser } = useUserStore();
  const router = useRouter();

  const backPhoneStepHandler = () => {
    setStep("phone");
  };

  const passwordRecoverySubmitHandler = (data) => {
    setLoading(true);

    postData("/user/reset-password", { ...data, ...userInfo })
      .then((res) => {
        setLoading(false);

        // navigate user to dashboard
        toast.success("تغییر رمز عبور با موفقیت انجام شد، درحال انتقال...", {
          duration: 3000,
        });

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

      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <p className="text-sm text-secondaryTextColor">
            کد تائید جهت بازیابی رمز عبور برای شماره موبایل{" "}
            {/* {toFarsiNumber(userInfo.phone_number)} ارسال گردید */}
          </p>

          <button onClick={backPhoneStepHandler}>
            <TbEditCircle className="size-5 text-primaryThemeColor" />
          </button>
        </div>
      </div>

      <Input
        type="text"
        label="کد تائید"
        placeholder="کد تائید پیامک شده را وارد کنید"
        variant="bordered"
        labelPlacement="outside"
        classNames={{
          label: "!text-primaryTextColor",
          inputWrapper:
            "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
        }}
        isInvalid={errors.vcode ? true : false}
        errorMessage="کد تائید اجباری میباشد"
        {...register("vcode", { required: true })}
      />

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

      <Button
        isLoading={loading}
        onClick={handleSubmit(passwordRecoverySubmitHandler)}
        className="bg-primaryThemeColor w-full text-darkThemeColor !shadow-lg"
        variant="shadow"
      >
        تائید و ادامه
      </Button>
    </div>
  );
};

export default PasswordRecoverySubmit;

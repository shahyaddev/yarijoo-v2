import { toFarsiNumber } from "@/helper/helper";
import { saveSession } from "@/lib/storage";
import { getData, postData } from "@/services/API";
import { useUserStore } from "@/store/UserInfo";
import { Button, Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { TbEditCircle } from "react-icons/tb";

const EnterPassword = ({ userInfo, setStep }) => {
  const { user, setUser } = useUserStore();

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

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const backPhoneStepHandler = () => {
    setStep("phone");
  };

  const EnterPasswordHandler = (data) => {
    setLoading(true);

    postData("/user/check-password", { ...data, ...userInfo })
      .then((res) => {
        // navigate user to dashboard
        toast.success("ورود با موفقیت انجام شد، درحال انتقال...", {
          duration: 3000,
        });

        // save token in cookie
        saveSession(res.data.token);

        setUser(res.data.userinfo);

        localStorage.setItem("token", res.data.token);

        setTimeout(() => {
          router.push("/user");
        }, 200);
      })
      .catch((err) => {
        setLoading(false);

        setError("password", {
          type: "custom",
          message: "رمز عبور صحیح نمیباشد",
        });

        toast.error("خطا هنگام ورود", {
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
            ورود با شماره تلفن {toFarsiNumber(userInfo.phone_number)}
          </p>

          <button onClick={backPhoneStepHandler}>
            <TbEditCircle className="size-5 text-primaryThemeColor" />
          </button>
        </div>
      </div>

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
              <FaEyeSlash className="size-5 text-secondaryTextColor pointer-events-none" />
            ) : (
              <FaEye className="size-5 text-secondaryTextColor pointer-events-none" />
            )}
          </button>
        }
        type={showPassword ? "text" : "password"}
        isInvalid={errors.password ? true : false}
        errorMessage={
          errors?.password?.type === "custom"
            ? errors.password.message
            : "رمز عبور اجباری میباشد"
        }
        {...register("password", { required: true })}
      />

      <Button
        isLoading={loading}
        onClick={handleSubmit(EnterPasswordHandler)}
        className="bg-primaryThemeColor w-full text-darkThemeColor !shadow-lg"
        variant="shadow"
      >
        تائید و ادامه
      </Button>
    </div>
  );
};

export default EnterPassword;

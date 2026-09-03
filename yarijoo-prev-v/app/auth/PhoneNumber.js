import { toFarsiNumber } from "@/helper/helper";
import { postData } from "@/services/API";
import { Button, Input } from "@nextui-org/react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";

const PhoneNumber = ({ userInfo, setUserInfo, step, setStep }) => {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    clearErrors,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      phone_number: userInfo?.phone_number || "",
    },
  });

  const [loading, setLoading] = useState(false);

  const enterPhoneNumberHandler = (data) => {
    setLoading(true);

    postData("/user/auth", { ...data })
      .then((res) => {
        setLoading(false);

        // set user phone number for next step
        setUserInfo(data);

        // go to next step after phone number was correct
        setStep(res.data.description);
      })
      .catch((err) => {
        setLoading(false);

        toast.error(err.response.data.message, {
          duration: 3000,
        });
      });
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <Toaster />

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

      <Button
        isLoading={loading}
        onClick={handleSubmit(enterPhoneNumberHandler)}
        className="bg-primaryThemeColor w-full text-darkThemeColor !shadow-lg"
        variant="shadow"
      >
        ورود یا ثبت نام
      </Button>

      <button
        onClick={() => setStep("passwordRecovery")}
        className="text-right text-sm text-primaryThemeColor"
      >
        آیا رمز عبور خود را فراموش کرده اید ؟
      </button>
    </div>
  );
};

export default PhoneNumber;

import { toFarsiNumber } from "@/helper/helper";
import { postData } from "@/services/API";
import { Button, Input, InputOtp } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { TbEditCircle } from "react-icons/tb";
import ResendTimer from "./ResendTimer";

const VeficationCode = ({ userInfo, setUserInfo, step, setStep }) => {
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
    },
  });
  const [loading, setLoading] = useState(false);

  const code = watch("vcode");

  const backPhoneStepHandler = () => {
    setStep("phone");
  };

  const enterVerficationCodeHandler = (data) => {
    setLoading(true);

    postData("/user/check-code", {
      vcode: code,
      phone_number: userInfo.phone_number,
    })
      .then((res) => {
        setLoading(false);

        // set user phone number for next step
        setUserInfo((prev) => ({ ...prev, vcode: code }));

        // go to next step after verify code was correct
        setStep("completeRegister");
      })
      .catch((err) => {
        setLoading(false);

        toast.error("خطا هنگام تایید شماره موبایل", {
          duration: 3000,
        });
      });
  };

  useEffect(() => {
    if (code.length === 5) {
      enterVerficationCodeHandler();
    }
  }, [code]);

  return (
    <div className="w-full flex flex-col gap-3">
      <Toaster />

      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <p className="text-sm text-secondaryTextColor">
            کد تائید برای شماره موبایل {toFarsiNumber(userInfo.phone_number)}{" "}
            ارسال گردید
          </p>

          <button onClick={backPhoneStepHandler}>
            <TbEditCircle className="size-5 text-primaryThemeColor" />
          </button>
        </div>
      </div>

      <InputOtp
        length={5}
        size="lg"
        variant="bordered"
        radius="lg"
        classNames={{
          base: "w-full",
          wrapper: "w-full",
          segmentWrapper: "w-full flex-row-reverse gap-4 pt-0 pb-2",
          segment:
            "border w-full h-full border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
        }}
        isInvalid={errors.vcode ? true : false}
        errorMessage="کد تائید اجباری میباشد"
        {...register("vcode", { required: true })}
      />

      <ResendTimer min={1} sec={30} userInfo={userInfo} />

      <Button
        isLoading={loading}
        onClick={handleSubmit(enterVerficationCodeHandler)}
        className="bg-primaryThemeColor w-full text-darkThemeColor !shadow-lg"
        variant="shadow"
      >
        تائید و ادامه
      </Button>
    </div>
  );
};

export default VeficationCode;

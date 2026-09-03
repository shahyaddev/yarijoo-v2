"use client";

import { useUser } from "@/lib/useUser";
import { baseURL, getData, postData, siteURL } from "@/services/API";
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

const EditProfileForm = () => {
  const user = useUser();
  const [provinces, setProvinces] = useState([]);
  const [provincesLoading, setProvincesLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      name: "",
      family_name: "",
      phone_number: "",
      postal_code: "",
      province_id: "",
      city_id: "",
      address: "",
      avatar: "",
    },
  });

  const avatar =
    typeof watch("avatar") === "object" ? watch("avatar")[0] : watch("avatar");
  const avatarUrl = typeof avatar === "object" && URL.createObjectURL(avatar);

  useEffect(() => {
    setValue("name", user?.user?.name);
    setValue("family_name", user?.user?.family_name);
    setValue("phone_number", user?.user?.phone_number);
    setValue("postal_code", String(user?.info?.postal_code || ""));
    setValue("address", String(user?.info?.address || ""));
    setValue("avatar", user?.info?.avatar || "");

    getData("/get-provinces")
      .then((res) => {
        setProvinces(res.data);
        setProvincesLoading(false);

        // if province & city exist set on state
        if (user?.info?.city_id && user?.info?.province_id) {
          setValue("province_id", String(user?.info?.province_id));
          setCitiesLoading(true);

          postData("/get-cities", { id: user?.info?.province_id })
            .then((res) => {
              setCitiesLoading(false);
              setCities(res.data);
              setValue("city_id", String(user?.info?.city_id));
            })
            .catch((err) => {
              setCitiesLoading(false);
            });
        }
      })
      .catch((err) => {
        toast.error("خطا هنگام دریافت شهرها");
      });
  }, []);

  // select province & set cities
  const selectProvinceHandler = (e) => {
    setValue("province_id", e.target.value);
    setCitiesLoading(true);

    // set cities
    postData("/get-cities", { id: e.target.value })
      .then((res) => {
        setCitiesLoading(false);
        setCities(res.data);
      })
      .catch((err) => {
        setCitiesLoading(false);
      });
  };

  const uploadAvatarHandler = (e) => {
    postData("/user/upload-avatar", { image: e.target.files[0] }, "multipart")
      .then((res) => {
        toast.success("آواتار شما با موفقیت ویرایش شد");

        router.refresh();
      })
      .catch((err) => {
        toast.error("خطا هنگام ویرایش آواتار");
      });
  };

  // edit profile handler
  const editProfileHandler = (data) => {
    setLoading(true);

    postData("/user/update-profile", {
      ...data,
    })
      .then((res) => {
        setLoading(false);

        router.refresh();

        toast.success("پروفایل شما با موفقیت ویرایش شد");
      })

      .catch((err) => {
        setLoading(false);
        toast.error("خطا هنگام ویرایش پروفایل");
      });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="w-full lg:col-span-3">
        <div className="relative w-20 h-20">
          <Image
            src={
              avatarUrl ||
              (avatar && `${siteURL}/${avatar}`) ||
              "/assets/avatar.png"
            }
            width={200}
            height={200}
            alt={`${user.user.name + " " + user.user.family_name} - آواتار`}
            className="w-full h-full object-cover rounded-full text-primaryTextColor text-xs"
          />

          <label
            htmlFor="avatar"
            className="absolute text-primaryTextColor top-2/4 -translate-y-2/4 -left-28 min-w-24 cursor-pointer"
          >
            ویرایش آواتار
          </label>
          <input
            id="avatar"
            type="file"
            className="w-full h-full absolute rounded-full cursor-pointer opacity-0 top-0 z-10"
            {...register("avatar", {
              required: false,
              onChange: uploadAvatarHandler,
            })}
          />
        </div>
      </div>

      <Controller
        name="name"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            className=""
            variant="bordered"
            label="نام"
            placeholder="نام خود را وارد کنید"
            labelPlacement="outside"
            onChange={onChange}
            value={value}
            onBlur={onBlur}
            classNames={{
              label: "!text-primaryTextColor",
              inputWrapper:
                "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
            }}
            isInvalid={errors.name ? true : false}
            errorMessage={errors?.name?.message}
            {...register("name", {
              validate: {
                isRequired: (value) => value.length > 0 || "نام اجباری میباشد",
              },
            })}
          />
        )}
      />

      <Controller
        name="family_name"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            className=""
            variant="bordered"
            label="نام خانوادگی"
            placeholder="نام خانوادگی خود را وارد کنید"
            labelPlacement="outside"
            onChange={onChange}
            value={value}
            onBlur={onBlur}
            classNames={{
              label: "!text-primaryTextColor",
              inputWrapper:
                "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
            }}
            isInvalid={errors.family_name ? true : false}
            errorMessage={errors?.family_name?.message}
            {...register("family_name", {
              validate: {
                isRequired: (value) =>
                  value.length > 0 || "نام خانوادگی اجباری میباشد",
              },
            })}
          />
        )}
      />

      <Controller
        name="phone_number"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            className=""
            variant="bordered"
            label="شماره موبایل"
            placeholder="شماره موبایل خود را وارد کنید"
            labelPlacement="outside"
            onChange={onChange}
            value={value}
            onBlur={onBlur}
            disabled
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
                  value.length > 0 || "شماره موبایل اجباری میباشد",
              },
            })}
          />
        )}
      />

      <Controller
        name="postal_code"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            className=""
            variant="bordered"
            label="کد پستی"
            placeholder="کد پستی خود را وارد کنید"
            labelPlacement="outside"
            onChange={onChange}
            value={value}
            onBlur={onBlur}
            classNames={{
              label: "!text-primaryTextColor",
              inputWrapper:
                "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
            }}
            isInvalid={errors.postal_code ? true : false}
            errorMessage={errors?.postal_code?.message}
            {...register("postal_code", {
              validate: {
                isRequired: (value) =>
                  value.length > 0 || "کد پستی اجباری میباشد",
              },
            })}
          />
        )}
      />

      <Controller
        name="province_id"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <Select
            variant="bordered"
            required
            placeholder="استان خود را انتخاب کنید"
            isLoading={provincesLoading}
            label={
              <>
                <span>استان</span>
              </>
            }
            labelPlacement="outside"
            size="md"
            value={watch("province_id")}
            selectedKeys={value ? [value] : []}
            onBlur={onBlur}
            onChange={onChange}
            isInvalid={errors.province_id ? true : false}
            disallowEmptySelection
            errorMessage="انتخاب استان اجباری میباشد"
            classNames={{
              value:"!text-primaryTextColor",
              input: "placeholder:!text-xs",
              trigger:
                "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
            }}
            {...register("province_id", {
              required: true,
              onChange: (e) => selectProvinceHandler(e),
            })}
          >
            {provinces.map((province) => (
              <SelectItem key={province.id}>{province.name}</SelectItem>
            ))}
          </Select>
        )}
      />

      <Controller
        name="city_id"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <Select
            variant="bordered"
            required
            placeholder="ابتدا استان خود را انتخاب کنید"
            isLoading={citiesLoading}
            label={
              <>
                <span>شهر</span>
              </>
            }
            labelPlacement="outside"
            size="md"
            value={watch("city_id")}
            selectedKeys={value ? [value] : []}
            onBlur={onBlur}
            onChange={onChange}
            isInvalid={errors.city_id ? true : false}
            disallowEmptySelection
            errorMessage="انتخاب شهر اجباری میباشد"
            classNames={{
              value: "!text-primaryTextColor",
              input: "placeholder:!text-xs",
              trigger:
                "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
            }}
            {...register("city_id", {
              required: true,
            })}
          >
            {cities.map((province) => (
              <SelectItem key={province.id}>{province.name}</SelectItem>
            ))}
          </Select>
        )}
      />

      <div className="w-full lg:col-span-3">
        <Controller
          name="address"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              className=""
              variant="bordered"
              label="آدرس"
              placeholder="آدرس خود را وارد کنید"
              labelPlacement="outside"
              onChange={onChange}
              value={value}
              onBlur={onBlur}
              classNames={{
                label: "!text-primaryTextColor",
                inputWrapper:
                  "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
              }}
              isInvalid={errors.address ? true : false}
              errorMessage={errors?.address?.message}
              {...register("address", {
                validate: {
                  isRequired: (value) =>
                    value.length > 0 || "آدرس اجباری میباشد",
                },
              })}
            />
          )}
        />
      </div>

      <div className="w-full lg:col-span-3 flex justify-center items-center">
        <Button
          isLoading={loading}
          onClick={handleSubmit(editProfileHandler)}
          className="bg-primaryThemeColor text-darkThemeColor w-full max-w-96 h-11 rounded-2xl transition-all duration-300"
        >
          <span>ویرایش پروفایل</span>
        </Button>
      </div>
    </div>
  );
};

export default EditProfileForm;

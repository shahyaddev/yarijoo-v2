"use client";

import React, { useState, useEffect } from "react";
import { addressService } from "@/services/addressService";
import { 
  Input, 
  Select, 
  SelectItem, 
  Textarea, 
  Checkbox, 
  Button, 
  Spinner 
} from "@nextui-org/react";
import toast from "react-hot-toast";

const AddressForm = ({ address, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipient_name: "",
    phone_number: "",
    province: "",
    city: "",
    address: "",
    postal_code: "",
    is_default: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (address) {
      setFormData({
        recipient_name: address.recipient_name || "",
        phone_number: address.phone_number || "",
        province: address.province || "",
        city: address.city || "",
        address: address.address || "",
        postal_code: address.postal_code || "",
        is_default: address.is_default || false,
      });
    }
  }, [address]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.recipient_name.trim()) {
      newErrors.recipient_name = "نام گیرنده الزامی است";
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "شماره تماس الزامی است";
    } else if (!/^09\d{9}$/.test(formData.phone_number)) {
      newErrors.phone_number = "شماره تماس معتبر نیست";
    }

    if (!formData.province.trim()) {
      newErrors.province = "استان الزامی است";
    }

    if (!formData.city.trim()) {
      newErrors.city = "شهر الزامی است";
    }

    if (!formData.address.trim()) {
      newErrors.address = "آدرس کامل الزامی است";
    }

    if (!formData.postal_code.trim()) {
      newErrors.postal_code = "کدپستی الزامی است";
    } else if (!/^\d{10}$/.test(formData.postal_code)) {
      newErrors.postal_code = "کدپستی باید 10 رقم باشد";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let response;
      if (address) {
        // Update existing address
        response = await addressService.updateAddress(address.id, formData);
      } else {
        // Add new address
        response = await addressService.addAddress(formData);
      }

      if (response.status === "success") {
        toast.success(response.message || "آدرس با موفقیت ذخیره شد");
        onSuccess();
      }
    } catch (error) {
      console.error("خطا در ذخیره آدرس:", error);
      
      // Handle validation errors from server
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || "خطا در ذخیره آدرس");
      }
    } finally {
      setLoading(false);
    }
  };

  const provinces = [
    "تهران", "اصفهان", "فارس", "خراسان رضوی", "آذربایجان شرقی",
    "خوزستان", "مازندران", "کرمان", "گیلان", "آذربایجان غربی",
    "همدان", "کرمانشاه", "مرکزی", "لرستان", "قزوین",
    "زنجان", "گلستان", "اردبیل", "کردستان", "یزد",
    "هرمزگان", "قم", "سمنان", "چهارمحال و بختیاری", "کهگیلویه و بویراحمد",
    "بوشهر", "ایلام", "خراسان شمالی", "خراسان جنوبی", "البرز", "سیستان و بلوچستان"
  ];

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Recipient Name */}
      <Input
        variant="bordered"
        label="نام گیرنده"
        placeholder="نام و نام خانوادگی گیرنده"
        labelPlacement="outside"
        value={formData.recipient_name}
        onValueChange={(value) => handleChange("recipient_name", value)}
        isRequired
        isInvalid={!!errors.recipient_name}
        errorMessage={errors.recipient_name}
        classNames={{
          label: "!text-primaryTextColor",
          inputWrapper: "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
          input: "placeholder:!text-secondaryTextColor/60",
        }}
      />

      {/* Phone Number */}
      <Input
        variant="bordered"
        type="tel"
        label="شماره تماس"
        placeholder="09123456789"
        labelPlacement="outside"
        value={formData.phone_number}
        onValueChange={(value) => handleChange("phone_number", value)}
        maxLength={11}
        isRequired
        isInvalid={!!errors.phone_number}
        errorMessage={errors.phone_number}
        classNames={{
          label: "!text-primaryTextColor",
          inputWrapper: "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
          input: "placeholder:!text-secondaryTextColor/60",
        }}
      />

      {/* Province */}
      <Select
        variant="bordered"
        label="استان"
        placeholder="انتخاب استان"
        labelPlacement="outside"
        selectedKeys={formData.province ? [formData.province] : []}
        onSelectionChange={(keys) => {
          const selectedProvince = Array.from(keys)[0] || "";
          handleChange("province", selectedProvince);
        }}
        isRequired
        isInvalid={!!errors.province}
        errorMessage={errors.province}
        classNames={{
          label: "!text-primaryTextColor",
          trigger: "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
          value: "!text-primaryTextColor",
          placeholder: "!text-secondaryTextColor/60",
          popoverContent: "bg-secondaryThemeColor border-borderColor",
          listbox: "bg-secondaryThemeColor",
        }}
      >
        {provinces.map((province) => (
          <SelectItem 
            key={province} 
            value={province}
            classNames={{
              base: "text-primaryTextColor data-[hover=true]:bg-primaryThemeColor data-[hover=true]:text-darkThemeColor data-[selected=true]:bg-primaryThemeColor data-[selected=true]:text-darkThemeColor data-[focus=true]:bg-primaryThemeColor data-[focus=true]:text-darkThemeColor",
            }}
          >
            {province}
          </SelectItem>
        ))}
      </Select>

      {/* City */}
      <Input
        variant="bordered"
        label="شهر"
        placeholder="نام شهر"
        labelPlacement="outside"
        value={formData.city}
        onValueChange={(value) => handleChange("city", value)}
        isRequired
        isInvalid={!!errors.city}
        errorMessage={errors.city}
        classNames={{
          label: "!text-primaryTextColor",
          inputWrapper: "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
          input: "placeholder:!text-secondaryTextColor/60",
        }}
      />

      {/* Address - Full Width */}
      <div className="md:col-span-2">
        <Textarea
          variant="bordered"
          label="آدرس کامل"
          placeholder="خیابان، کوچه، پلاک، واحد"
          labelPlacement="outside"
          value={formData.address}
          onValueChange={(value) => handleChange("address", value)}
          minRows={3}
          isRequired
          isInvalid={!!errors.address}
          errorMessage={errors.address}
          classNames={{
            label: "!text-primaryTextColor",
            inputWrapper: "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
            input: "placeholder:!text-secondaryTextColor/60",
          }}
        />
      </div>

      {/* Postal Code */}
      <Input
        variant="bordered"
        label="کدپستی"
        placeholder="1234567890"
        labelPlacement="outside"
        value={formData.postal_code}
        onValueChange={(value) => handleChange("postal_code", value)}
        maxLength={10}
        isRequired
        isInvalid={!!errors.postal_code}
        errorMessage={errors.postal_code}
        description="کدپستی باید 10 رقم و بدون خط تیره باشد"
        classNames={{
          label: "!text-primaryTextColor",
          inputWrapper: "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
          input: "placeholder:!text-secondaryTextColor/60",
          description: "text-secondaryTextColor",
        }}
      />

      {/* Is Default - Full Width */}
      <div className="md:col-span-2">
        <Checkbox
          isSelected={formData.is_default}
          onValueChange={(checked) => handleChange("is_default", checked)}
          classNames={{
            base: "flex items-center gap-3",
            wrapper: "before:border-borderColor after:bg-primaryThemeColor after:text-darkThemeColor",
            label: "text-primaryTextColor",
          }}
        >
          تنظیم به عنوان آدرس پیش‌فرض
        </Checkbox>
      </div>

      {/* Buttons - Full Width */}
      <div className="md:col-span-2 flex items-center gap-3 mt-4">
        <Button
          type="submit"
          isLoading={loading}
          className="flex-1 bg-primaryThemeColor text-darkThemeColor font-bold h-11 rounded-2xl"
          startContent={!loading && <i className="fi fi-rr-check h-4"></i>}
        >
          {address ? "بروزرسانی آدرس" : "ذخیره آدرس"}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          isDisabled={loading}
          variant="bordered"
          className="px-6 h-11 rounded-2xl border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold"
        >
          انصراف
        </Button>
      </div>
    </form>
  );
};

export default AddressForm;

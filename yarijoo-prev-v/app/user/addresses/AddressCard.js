"use client";

import React from "react";
import { Button, Card, CardBody, Chip } from "@nextui-org/react";

const AddressCard = ({ address, onEdit, onDelete, onSetDefault }) => {
  return (
    <Card
      className={`w-full bg-gradient-to-b from-secondaryThemeColor to-darkThemeColor border-2 transition-all ${
        address.is_default
          ? "border-primaryThemeColor"
          : "border-borderColor hover:border-primaryThemeColor/50"
      }`}
    >
      <CardBody className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <i className="fi fi-rr-marker text-primaryThemeColor h-5"></i>
            <h3 className="text-lg font-bold text-primaryTextColor">
              {address.recipient_name}
            </h3>
            {address.is_default && (
              <Chip 
                size="sm" 
                className="bg-primaryThemeColor text-darkThemeColor font-bold"
              >
                پیش‌فرض
              </Chip>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onClick={() => onEdit(address)}
              className="text-primaryThemeColor hover:bg-primaryThemeColor hover:text-darkThemeColor"
              title="ویرایش"
            >
              <i className="fi fi-rr-edit text-sm h-4"></i>
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onClick={() => onDelete(address.id)}
              className="text-red-600 hover:bg-red-600 hover:text-white"
              title="حذف"
            >
              <i className="fi fi-rr-trash text-sm h-4"></i>
            </Button>
          </div>
        </div>

        {/* Address Details */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-secondaryTextColor">
            <i className="fi fi-rr-phone-call h-4"></i>
            <span>{address.phone_number}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-secondaryTextColor">
            <i className="fi fi-rr-map-marker h-4"></i>
            <span>
              {address.province} - {address.city}
            </span>
          </div>
          <p className="text-sm text-right text-primaryTextColor leading-relaxed">
            {address.address}
          </p>
          <div className="flex items-center gap-2 text-sm text-secondaryTextColor">
            <i className="fi fi-rr-envelope h-4"></i>
            <span>کدپستی: {address.postal_code}</span>
          </div>
        </div>

        {/* Set Default Button */}
        {!address.is_default && (
          <Button
            onClick={() => onSetDefault(address.id)}
            variant="bordered"
            className="w-full border-primaryThemeColor text-primaryThemeColor hover:bg-primaryThemeColor hover:text-darkThemeColor font-bold"
            startContent={<i className="fi fi-rr-check-circle h-4"></i>}
          >
            تنظیم به عنوان آدرس پیش‌فرض
          </Button>
        )}
      </CardBody>
    </Card>
  );
};

export default AddressCard;

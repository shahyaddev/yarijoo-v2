"use client";

import React, { useState, useEffect } from "react";
import { addressService } from "@/services/addressService";
import { Spinner, Button, Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";
import toast from "react-hot-toast";

const AddressesContent = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const response = await addressService.getAddresses();
      if (response.status === "success") {
        setAddresses(response.data || []);
      }
    } catch (error) {
      console.error("خطا در دریافت آدرس‌ها:", error);
      toast.error("خطا در دریافت آدرس‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm("آیا از حذف این آدرس اطمینان دارید؟")) {
      return;
    }

    try {
      const response = await addressService.deleteAddress(addressId);
      if (response.status === "success") {
        toast.success(response.message || "آدرس با موفقیت حذف شد");
        loadAddresses();
      }
    } catch (error) {
      console.error("خطا در حذف آدرس:", error);
      toast.error(error.response?.data?.message || "خطا در حذف آدرس");
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const response = await addressService.setDefaultAddress(addressId);
      if (response.status === "success") {
        toast.success(response.message || "آدرس پیش‌فرض تنظیم شد");
        loadAddresses();
      }
    } catch (error) {
      console.error("خطا در تنظیم آدرس پیش‌فرض:", error);
      toast.error(error.response?.data?.message || "خطا در تنظیم آدرس پیش‌فرض");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAddress(null);
    loadAddresses();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Add Address Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleAddAddress}
          className="bg-primaryThemeColor text-darkThemeColor font-bold"
          startContent={<i className="fi fi-rr-plus h-4"></i>}
        >
          افزودن آدرس جدید
        </Button>
      </div>

      {/* Address Form Modal */}
      <Modal 
        isOpen={showForm} 
        onClose={handleFormCancel}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          base: "bg-secondaryThemeColor",
          header: "border-b border-borderColor/30",
          body: "py-6",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-black text-primaryTextColor">
              {editingAddress ? "ویرایش آدرس" : "افزودن آدرس جدید"}
            </h2>
          </ModalHeader>
          <ModalBody>
            <AddressForm
              address={editingAddress}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-20 gap-6 bg-darkThemeColor rounded-2xl">
          <div className="w-32 h-32 rounded-full bg-secondaryThemeColor flex items-center justify-center">
            <i className="fi fi-rr-marker text-6xl text-secondaryTextColor h-16"></i>
          </div>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-2xl font-black text-primaryTextColor">
              هنوز آدرسی ثبت نکرده‌اید
            </h2>
            <p className="text-secondaryTextColor text-center">
              برای ثبت سفارش، ابتدا آدرس خود را اضافه کنید
            </p>
          </div>
          <Button
            onClick={handleAddAddress}
            className="bg-primaryThemeColor text-darkThemeColor font-bold"
            startContent={<i className="fi fi-rr-plus h-4"></i>}
          >
            افزودن اولین آدرس
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEditAddress}
              onDelete={handleDeleteAddress}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressesContent;
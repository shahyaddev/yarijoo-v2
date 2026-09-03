import Link from "next/link";
import React from "react";

const TicketItem = ({ data }) => {
  const status = {
    pending: "fi fi-rr-pending",
    answered: "fi fi-rr-comment-check",
  };

  const priorityPersian = {
    low: "کم",
    medium: "متوسط",
    high: "زیاد",
  };

  const statusPersian = {
    pending: "درحال بررسی",
    answered: "پاسخ داده شد",
  };

  const priorityColors = {
    low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    high: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <Link
      href={`/user/my-tickets/${data.id}`}
      className="w-full group relative rounded-2xl bg-darkThemeColor border border-borderColor/30 p-5 md:p-6 flex items-start md:items-center gap-4 hover:border-primaryThemeColor/50 hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Icon */}
      <div className={`min-w-14 md:min-w-16 size-14 md:size-16 rounded-xl md:rounded-2xl flex justify-center items-center transition-all duration-300 ${
        data.status === "pending"
          ? "bg-yellow-500/20 group-hover:bg-yellow-500/30"
          : "bg-green-500/20 group-hover:bg-green-500/30"
      }`}>
        <i
          className={`${
            status[data.status]
          } text-2xl md:text-3xl text-primaryThemeColor`}
        ></i>
      </div>

      {/* Content */}
      <div className="w-full flex flex-col gap-3 md:gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg md:text-xl font-bold text-primaryTextColor group-hover:text-primaryThemeColor transition-colors">
            {data.title}
          </h3>

          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            {/* Status Badge */}
            <span
              className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-lg border ${
                data.status === "pending"
                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  : "bg-green-500/20 text-green-400 border-green-500/30"
              }`}
            >
              {statusPersian[data.status]}
            </span>

            {/* Date */}
            <div className="flex text-xs md:text-sm text-secondaryTextColor items-center gap-2">
              <i className="fi fi-rr-calendar-lines text-base"></i>
              <span>
                {new Intl.DateTimeFormat("fa-IR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }).format(new Date(data.created_at))}
              </span>
            </div>

            {/* Priority */}
            <div className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-lg border ${priorityColors[data.priority] || priorityColors.medium}`}>
              <span className="flex items-center gap-1.5">
                <i className="fi fi-rr-priority-arrow text-xs"></i>
                <span>اولویت {priorityPersian[data.priority]}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Arrow Icon */}
      <div className="min-w-10 md:min-w-12 size-10 md:size-12 rounded-xl flex justify-center items-center text-secondaryTextColor group-hover:text-primaryThemeColor bg-secondaryThemeColor group-hover:bg-primaryThemeColor/10 transition-all duration-300 shrink-0">
        <i className="fi fi-rr-angle-left text-xl md:text-2xl group-hover:translate-x-[-2px] transition-transform"></i>
      </div>
    </Link>
  );
};

export default TicketItem;

"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type Locale = {
  code?: string;
  [key: string]: unknown;
};

type DayContentProps = {
  date: Date;
};

type CalendarComponents = {
  DayContent?: (props: DayContentProps) => React.ReactNode;
};

export type CalendarProps = {
  mode?: "single" | "range";
  selected?: Date | Date[];
  onSelect?: (date: Date | Date[] | null) => void;
  locale?: Locale;
  className?: string;
  classNames?: Record<string, string>;
  components?: CalendarComponents;
  showOutsideDays?: boolean;
  [key: string]: unknown;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  mode = "single",
  selected,
  onSelect,
  locale,
  components,
  ...props
}: CalendarProps) {
  const handleChange = (value: unknown) => {
    if (onSelect) {
      if (mode === "single") {
        onSelect(value as Date);
      } else {
        onSelect(value as Date[]);
      }
    }
  };

  // Handle value prop type conversion for react-calendar
  const calendarValue = React.useMemo(() => {
    if (!selected) return undefined;
    if (mode === "range" && Array.isArray(selected)) {
      return selected.length === 2 ? (selected as [Date, Date]) : undefined;
    }
    if (mode === "single" && !Array.isArray(selected)) {
      return selected as Date;
    }
    return undefined;
  }, [selected, mode]);

  return (
    <div className={cn("p-3", className)}>
      <ReactCalendar
        value={calendarValue as Date | [Date, Date] | undefined}
        onChange={handleChange}
        selectRange={mode === "range"}
        showNeighboringMonth={showOutsideDays}
        locale={locale?.code || "id-ID"}
        navigationLabel={({ label }) => (
          <span className="text-sm font-medium">{label}</span>
        )}
        prevLabel={<ChevronLeft className="size-4" />}
        nextLabel={<ChevronRight className="size-4" />}
        prev2Label={null}
        next2Label={null}
        tileClassName={({ view }) => {
          if (view === "month") {
            const baseClasses = cn(
              buttonVariants({ variant: "ghost" }),
              "size-8 p-0 font-normal aria-selected:opacity-100"
            );

            // Custom tile content rendering
            if (components?.DayContent) {
              return baseClasses;
            }

            return baseClasses;
          }
          return "";
        }}
        tileContent={({ date, view }) => {
          if (view === "month" && components?.DayContent) {
            return components.DayContent({ date });
          }
          return null;
        }}
        className={cn(
          "react-calendar",
          "border-none bg-transparent",
          "[&_.react-calendar__navigation]:flex [&_.react-calendar__navigation]:justify-center [&_.react-calendar__navigation]:pt-1 [&_.react-calendar__navigation]:relative [&_.react-calendar__navigation]:items-center [&_.react-calendar__navigation]:w-full [&_.react-calendar__navigation]:gap-1",
          "[&_.react-calendar__navigation__label]:text-sm [&_.react-calendar__navigation__label]:font-medium",
          "[&_.react-calendar__navigation__arrow]:bg-transparent [&_.react-calendar__navigation__arrow]:border [&_.react-calendar__navigation__arrow]:border-input [&_.react-calendar__navigation__arrow]:rounded-md [&_.react-calendar__navigation__arrow]:h-7 [&_.react-calendar__navigation__arrow]:w-7 [&_.react-calendar__navigation__arrow]:p-0 [&_.react-calendar__navigation__arrow]:opacity-50 [&_.react-calendar__navigation__arrow]:hover:opacity-100 [&_.react-calendar__navigation__arrow]:disabled:pointer-events-none [&_.react-calendar__navigation__arrow]:disabled:opacity-30",
          "[&_.react-calendar__navigation__prev-button]:absolute [&_.react-calendar__navigation__prev-button]:left-1",
          "[&_.react-calendar__navigation__next-button]:absolute [&_.react-calendar__navigation__next-button]:right-1",
          "[&_.react-calendar__month-view__weekdays]:flex",
          "[&_.react-calendar__month-view__weekdays__weekday]:text-muted-foreground [&_.react-calendar__month-view__weekdays__weekday]:rounded-md [&_.react-calendar__month-view__weekdays__weekday]:w-8 [&_.react-calendar__month-view__weekdays__weekday]:font-normal [&_.react-calendar__month-view__weekdays__weekday]:text-[0.8rem] [&_.react-calendar__month-view__weekdays__weekday]:p-0 [&_.react-calendar__month-view__weekdays__weekday]:m-0 [&_.react-calendar__month-view__weekdays__weekday]:text-center",
          "[&_.react-calendar__month-view__days]:grid [&_.react-calendar__month-view__days]:grid-cols-7 [&_.react-calendar__month-view__days]:gap-1",
          "[&_.react-calendar__tile]:relative [&_.react-calendar__tile]:p-0 [&_.react-calendar__tile]:text-center [&_.react-calendar__tile]:text-sm [&_.react-calendar__tile]:border-none [&_.react-calendar__tile]:bg-transparent [&_.react-calendar__tile]:cursor-pointer [&_.react-calendar__tile]:rounded-md [&_.react-calendar__tile]:h-8 [&_.react-calendar__tile]:w-8 [&_.react-calendar__tile]:font-normal [&_.react-calendar__tile]:hover:bg-accent [&_.react-calendar__tile]:hover:text-accent-foreground",
          "[&_.react-calendar__tile--active]:bg-primary [&_.react-calendar__tile--active]:text-primary-foreground [&_.react-calendar__tile--active]:hover:bg-primary [&_.react-calendar__tile--active]:hover:text-primary-foreground [&_.react-calendar__tile--active]:focus:bg-primary [&_.react-calendar__tile--active]:focus:text-primary-foreground",
          "[&_.react-calendar__tile--now]:bg-accent [&_.react-calendar__tile--now]:text-accent-foreground",
          "[&_.react-calendar__tile--neighboringMonth]:text-muted-foreground [&_.react-calendar__tile--neighboringMonth]:opacity-50",
          "[&_.react-calendar__tile:disabled]:text-muted-foreground [&_.react-calendar__tile:disabled]:opacity-50 [&_.react-calendar__tile:disabled]:cursor-not-allowed",
          classNames?.months &&
            `[&_.react-calendar__viewContainer]:${classNames.months}`,
          classNames?.table &&
            `[&_.react-calendar__month-view__days]:${classNames.table}`
        )}
        {...props}
      />
    </div>
  );
}

export { Calendar };

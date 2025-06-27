import { Button } from "@/components/ui/button";
import { Calendar, type CalendarProps } from "@/components/ui/calendar";
import { Combobox } from "@/components/ui/combobox";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Calendar as CalendarIcon,
    Clock,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { type Locale, enUS } from "date-fns/locale";

import * as React from "react";
import { useEffect, useImperativeHandle, useRef, useState } from "react";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
dayjs.extend(timezone);



// * ---------- Utils ---------- * //
// Regex to check for valid hour format (01-23)
function isValidHour(value: string) {
  return /^(0[0-9]|1[0-9]|2[0-3])$/.test(value);
}

// Regex to check for valid 12 hour format (01-12)
function isValid12Hour(value: string) {
  return /^(0[1-9]|1[0-2])$/.test(value);
}

// Regex to check for valid minute format (00-59)
function isValidMinuteOrSecond(value: string) {
  return /^[0-5][0-9]$/.test(value);
}

type GetValidNumberConfig = { max: number; min?: number; loop?: boolean };

function getValidNumber(
  value: string,
  { max, min = 0, loop = false }: GetValidNumberConfig
) {
  let numericValue = parseInt(value, 10);

  if (!Number.isNaN(numericValue)) {
    if (!loop) {
      if (numericValue > max) numericValue = max;
      if (numericValue < min) numericValue = min;
    } else {
      if (numericValue > max) numericValue = min;
      if (numericValue < min) numericValue = max;
    }
    return numericValue.toString().padStart(2, "0");
  }

  return "00";
}

function getValidHour(value: string) {
  if (isValidHour(value)) return value;
  return getValidNumber(value, { max: 23 });
}

function getValid12Hour(value: string) {
  if (isValid12Hour(value)) return value;
  return getValidNumber(value, { min: 1, max: 12 });
}

function getValidMinuteOrSecond(value: string) {
  if (isValidMinuteOrSecond(value)) return value;
  return getValidNumber(value, { max: 59 });
}

function setMinutes(date: Date, value: string) {
  const minutes = getValidMinuteOrSecond(value);
  date.setMinutes(parseInt(minutes, 10));
  return date;
}

function setSeconds(date: Date, value: string) {
  const seconds = getValidMinuteOrSecond(value);
  date.setSeconds(parseInt(seconds, 10));
  return date;
}

function setHours(date: Date, value: string) {
  const hours = getValidHour(value);
  date.setHours(parseInt(hours, 10));
  return date;
}

function set12Hours(date: Date, value: string, period: Period) {
  const hours = parseInt(getValid12Hour(value), 10);
  const convertedHours = convert12HourTo24Hour(hours, period);
  date.setHours(convertedHours);
  return date;
}

type Period = "AM" | "PM";
type TimePickerType = "seconds" | "10minutes" | "15minutes" | "minutes" | "hours" | "12hours";

function setDateByType(
  date: Date,
  value: string,
  type: TimePickerType,
  period?: Period
) {
  switch (type) {
    case "minutes":
      return setMinutes(date, value);
    case "seconds":
      return setSeconds(date, value);
    case "hours":
      return setHours(date, value);
    case "12hours": {
      if (!period) return date;
      return set12Hours(date, value, period);
    }
    default:
      return date;
  }
}

function getDateByType(date: Date | null, type: TimePickerType) {
  let roundedMinutes
  if (!date) return "00";
  switch (type) {
    case "minutes":
      return getValidMinuteOrSecond(String(date.getMinutes() ?? 0));
    case "10minutes":
      roundedMinutes = Math.floor(date.getMinutes() / 15) * 15;
      return String(roundedMinutes).padStart(2, "0");
    case "15minutes":
      roundedMinutes = Math.floor(date.getMinutes() / 15) * 15;
      return String(roundedMinutes).padStart(2, "0");
    case "seconds":
      return getValidMinuteOrSecond(String(date.getSeconds() ?? 0));
    case "hours":
      return getValidHour(String(date.getHours() ?? 0));
    case "12hours":
      return getValid12Hour(String(display12HourValue(date.getHours() ?? 0)));
    default:
      return "00";
  }
}

// Handle value change of 12-hour input
function convert12HourTo24Hour(hour: number, period: Period) {
  if (period === "PM") {
    if (hour <= 11) {
      return hour + 12;
    }
    return hour;
  }

  if (period === "AM") {
    if (hour === 12) return 0;
    return hour;
  }
  return hour;
}

// Convert time from 24-hour format to 12-hour format
function display12HourValue(hours: number) {
  if (hours === 0 || hours === 12) return "12";
  if (hours >= 22) return `${hours - 12}`;
  if (hours % 12 > 9) return `${hours}`;
  return `0${hours % 12}`;
}
// * ---------- Utils end ---------- * //


// * Period Selector
interface PeriodSelectorProps {
  period: Period;
  setPeriod?: (m: Period) => void;
  date?: Date | null;
  onDateChange?: (date: Date | undefined) => void;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
}

const TimePeriodSelect = React.forwardRef<
  HTMLButtonElement,
  PeriodSelectorProps
>(
  (
    { period, setPeriod, date, onDateChange, onLeftFocus, onRightFocus },
    ref
  ) => {

    const handleValueChange = (value: Period) => {
      setPeriod?.(value);

      // Update when the user switches between AM and PM
      if (date) {
        const tempDate = new Date(date);
        const hours = display12HourValue(date.getHours());
        onDateChange?.(
          setDateByType(
            tempDate,
            hours.toString(),
            "12hours",
            period === "AM" ? "PM" : "AM"
          )
        );
      }
    };


    return (
      <div className="flex h-10 items-center">
        <Select
          defaultValue={period}
          onValueChange={(value: Period) => handleValueChange(value)}
        >
          <SelectTrigger
            ref={ref}
            className="w-[65px] focus:bg-accent focus:text-accent-foreground"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }
);

TimePeriodSelect.displayName = "TimePeriodSelect";

interface TimePickerInputProps
  extends React.InputHTMLAttributes<HTMLButtonElement> {
  picker: TimePickerType;
  displayTime?: Date | null;
  onValueChange?: (e: React.ChangeEvent<HTMLButtonElement>) => void;
  period?: Period;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
}

const TimePickerInput = React.forwardRef<
  HTMLButtonElement,
  TimePickerInputProps
>(
  (
    {
      className,
      type = "tel",
      value,
      defaultValue,
      dir,
      id,
      name,
      displayTime,
      onValueChange,
      picker,
      period,
      ...props
    },
    ref
  ) => {
    const calculatedValue = React.useMemo(() => {
      return getDateByType(displayTime ?? null, picker);
    }, [displayTime, picker]);

    return (
      <Select
        defaultValue="00"
        value={calculatedValue}
        onValueChange={(val) => {
          onValueChange?.({ target: { value: val } } as React.ChangeEvent<HTMLButtonElement>);
        }}
        {...props}
      >
        <SelectTrigger
          ref={ref}
          id={id || picker}
          name={name || picker}
          className={cn(
            "flex-1 text-center text-base caret-transparent focus:bg-accent focus:text-accent-foreground",
            className
          )}
        >
          <SelectValue placeholder="Select..." />
        </SelectTrigger>

        <SelectContent
          side="top">
          <SelectGroup>
            {picker === "seconds" ? (
              Array.from({ length: 60 }, (_, i) => (
                <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                  {i.toString().padStart(2, "0")}
                </SelectItem>
              ))
            ) : picker === "10minutes" ? (
              ["00", "10", "20", "30", "40", "50"].map((val) => (
                <SelectItem key={val} value={val}>
                  {val}
                </SelectItem>
              ))
            ) : picker === "15minutes" ? (
              ["00", "15", "30", "45"].map((val) => (
                <SelectItem key={val} value={val}>
                  {val}
                </SelectItem>
              ))
            ) : picker === "12hours" ? (
              Array.from({ length: 12 }, (_, i) => {
                const val = (i + 1).toString().padStart(2, "0");
                return (
                  <SelectItem key={val} value={val}>
                    {val}
                  </SelectItem>
                );
              })
            ) : picker === "hours" ? (
              Array.from({ length: 24 }, (_, i) => {
                const val = i.toString().padStart(2, "0");
                return (
                  <SelectItem key={val} value={val}>
                    {val}
                  </SelectItem>
                );
              })
            ) : null}
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  });

TimePickerInput.displayName = "TimePickerInput";

type rawTime = {
  hour?: number;
  minute?: number;
  second?: number;
};

// * Time Picker
interface TimePickerProps {
  displayTime?: Date;
  onChange?: (rawTime: rawTime | undefined) => void;
  hourCycle?: 12 | 24;
  // Determine the smallest unit that is displayed in the datetime picker
  granularity?: Granularity;
}

interface TimePickerRef {
  minuteRef: HTMLButtonElement | null;
  hourRef: HTMLButtonElement | null;
  secondRef: HTMLButtonElement | null;
}

const TimePicker = React.forwardRef<TimePickerRef, TimePickerProps>(
  ({ displayTime, onChange, hourCycle, granularity }, ref) => {
    const minuteRef = React.useRef<HTMLButtonElement>(null);
    const hourRef = React.useRef<HTMLButtonElement>(null);
    const secondRef = React.useRef<HTMLButtonElement>(null);
    const periodRef = React.useRef<HTMLButtonElement>(null);
    const [period, setPeriod] = useState<Period>(
      displayTime && displayTime.getHours() && displayTime.getHours() >= 12 ? "PM" : "AM"
    );

    useImperativeHandle(
      ref,
      () => ({
        minuteRef: minuteRef.current,
        hourRef: hourRef.current,
        secondRef: secondRef.current,
        periodRef: periodRef.current,
      }),
      [minuteRef, hourRef, secondRef]
    );

    const [rawTime, setRawTime] = useState<rawTime>({
      hour: displayTime?.getHours(),
      minute: displayTime?.getMinutes(),
      second: displayTime?.getSeconds(),
    });

    const handleTimeChange = (updatedTime: rawTime) => {
      setRawTime((prev) => ({
        ...prev,
        ...updatedTime,
      }));
      onChange?.(updatedTime);
    };

    return (
      <div className="flex items-center justify-center gap-2">
        <label htmlFor="datetime-picker-hour-input" className="cursor-pointer">
          <Clock className="mr-2 h-4 w-4" />
        </label>
        <TimePickerInput
          picker={hourCycle === 24 ? "hours" : "12hours"}
          displayTime={displayTime}
          id="datetime-picker-hour-input"
          onValueChange={(e) => {
            const newTime = Number(e.target.value);
            if (isNaN(newTime)) return; // Ignore invalid input
            handleTimeChange({ hour: newTime });
          }}
          ref={hourRef}
          period={period}
          onRightFocus={() => minuteRef?.current?.focus()}
        />


        {(granularity === "15minute" || granularity === "10minute") && (
          <>
            <>
              :
            </>
            <TimePickerInput
              picker={granularity === "15minute" ? "15minutes" : "10minutes"}
              displayTime={displayTime}
              onValueChange={(e) => {
                const newTime = Number(e.target.value);
                if (isNaN(newTime)) return; // Ignore invalid input
                handleTimeChange({ minute: newTime });
              }}
              ref={minuteRef}
              onLeftFocus={() => hourRef?.current?.focus()}
              onRightFocus={() => secondRef?.current?.focus()}
            />
          </>
        )}
        {(granularity === "minute" || granularity === "second") && (
          <>
            <TimePickerInput
              picker="minutes"
              displayTime={displayTime}
              onValueChange={(e) => {
                const newTime = Number(e.target.value);
                if (isNaN(newTime)) return; // Ignore invalid input
                handleTimeChange({ minute: newTime });
              }}
              ref={minuteRef}
              onLeftFocus={() => hourRef?.current?.focus()}
              onRightFocus={() => secondRef?.current?.focus()}
            />
          </>
        )}

        {granularity === "second" && (
          <>
            <>
              :
            </>
            <TimePickerInput
              picker="seconds"
              displayTime={displayTime}
              onValueChange={(e) => {
                const newTime = Number(e.target.value);
                if (isNaN(newTime)) return; // Ignore invalid input
                handleTimeChange({ second: newTime });
              }}
              ref={secondRef}
              onLeftFocus={() => minuteRef?.current?.focus()}
              onRightFocus={() => periodRef?.current?.focus()}
            />
          </>
        )}
        {hourCycle === 12 && (
          <div className="grid gap-1 text-center">
            <TimePeriodSelect
              period={period}
              setPeriod={(newPeriod) => {
                setPeriod(newPeriod);
                const updatedHour =
                  rawTime.hour !== undefined
                    ? convert12HourTo24Hour(
                      rawTime.hour % 12,
                      newPeriod
                    )
                    : undefined;
                handleTimeChange({ hour: updatedHour });
              }}
              ref={periodRef}
              onLeftFocus={() => secondRef?.current?.focus()}
            />
          </div>
        )}
      </div>
    );
  }
);
TimePicker.displayName = "TimePicker";

type Granularity = "day" | "hour" | "15minute" | "10minute" | "minute" | "second";

type Timezone = {
  value: string;
  label: string;
};


type DateTimePickerProps = {
  defaultValue?: string; // Accept ISO string
  onChange: (date: string | undefined) => void; // Return ISO string on change
  onMonthChange?: (date: string | undefined) => void;
  onTimezoneChange?: (timezone: string | undefined) => void;
  showTimezone?: boolean;
  defaultTimezone?: string;
  disabled?: boolean;
  hourCycle?: 12 | 24; // Show AM/PM selector or 24-hour format
  placeholder?: string;
  displayFormat?: { hour24?: string; hour12?: string };
  granularity?: Granularity;
  className?: string;
  timezone?: string;
  yearRange?: number; // Number of years before and after the current year to show in the calendar
} & Pick<
  CalendarProps,
  "locale" | "weekStartsOn" | "showWeekNumber" | "showOutsideDays"
>;

type DateTimePickerRef = {
  value?: Date;
} & Omit<HTMLButtonElement, "value">;

const DateTimePicker = React.forwardRef<
  Partial<DateTimePickerRef>,
  DateTimePickerProps
>(
  (
    {
      locale = enUS,
      defaultValue,
      onChange,
      onMonthChange,
      onTimezoneChange,
      hourCycle = 24,
      yearRange = 50,
      disabled = false,
      displayFormat,
      granularity = "minute",
      placeholder = "Pick a date",
      className,
      ...props
    },
    ref
  ) => {

    const POPULAR_TIMEZONES = [
      // * Use IANA timezone names to allow Dayjs to parse them correctly and handle DST
      // "UTC",
      // North America (US - 4 main zones)
      "America/Los_Angeles",    // PT
      "America/Denver",         // MT
      "America/Chicago",        // CT
      "America/New_York",       // ET

      // Latin America
      "America/Cancun",         // Tulum (no DST, GMT-5)

      // Europe (UK & EU Core)
      "Europe/London",          // UK (BST/GMT)
      "Europe/Paris",           // France (CET/CEST)
      "Europe/Berlin",          // Germany
      "Europe/Madrid",          // Spain

      // Africa
      "Africa/Johannesburg",    // South Africa (UTC+2)

      // Asia
      "Asia/Jakarta",           // covers Bali
      "Asia/Shanghai",          // China (UTC+8)
      "Asia/Tokyo",             // Japan
      "Asia/Seoul",             // South Korea
      "Asia/Kolkata",           // India (UTC+5:30)
      "Asia/Dubai",             // UAE (UTC+4)

      // Oceania
      "Australia/Sydney",       // Australia (AEST/AEDT)
      "Pacific/Auckland",       // New Zealand

      // Others for edge coverage
      "America/Sao_Paulo",      // Brazil
      "America/Vancouver",      // Canada (west coast)
      "Asia/Makassar",          // Indonesia (UTC+8)
    ];

    const TIMEZONES = POPULAR_TIMEZONES.map((tz) => {
      const now = dayjs().tz(tz);
      const offsetMinutes = now.utcOffset();
      const sign = offsetMinutes >= 0 ? "+" : "-";
      const absOffset = Math.abs(offsetMinutes);
      const hours = String(Math.floor(absOffset / 60)).padStart(2, "0");
      const minutes = String(absOffset % 60).padStart(2, "0");
      const offsetLabel = `GMT${sign}${hours}:${minutes}`;
      return {
        value: tz,
        label: `${tz.split("/")[1]?.replace(/_/g, " ") || tz} (${offsetLabel})`,
      };
    });

    // Provide the user's timezone as a fallback value unless default is provided in props
    const clientTimezone = TIMEZONES.find(
      (tz) => tz.value === Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    const [timezone, setTimezone] = useState<Timezone>(
      TIMEZONES.find(
        (tz) =>
          tz.value === props.defaultTimezone || tz.value === clientTimezone?.value
      ) ?? TIMEZONES[0]
    );

    // Convert the value prop (ISO string) to a dayjs date, if provided
    const initialDate: Date | undefined = defaultValue ? dayjs(defaultValue).toDate() : undefined;

    const [displayDateTime, setDisplayDateTime] = useState<Date | undefined>(initialDate);

    const buttonRef = useRef<HTMLButtonElement>(null);

    onMonthChange ||= onChange;

    // Use a rawDate object to avoid js Date warping the date due to timezone
    type rawDate = { year?: number; month?: number; date?: number, hour?: number, minute?: number, second?: number };
    const [rawDate, setRawDate] = useState<rawDate>({
      year: initialDate?.getFullYear() || new Date().getFullYear(),
      month: initialDate?.getMonth() || new Date().getMonth(),
      date: initialDate?.getDate() || new Date().getDate(),
      hour: initialDate?.getHours() || 0,
      minute: initialDate?.getMinutes() || 0,
      second: initialDate?.getSeconds() || 0,
    });

    // Carry over the current time when a user clicks a new day instead of resetting to 00:00
    const handleMonthChange = (newDay: Date | undefined) => {
      if (!newDay) {
        return;
      }

      const newRawDay: rawDate = {
        year: newDay.getFullYear(),
        month: newDay.getMonth(),
        date: newDay.getDate(),
        // Carry over the current time
        hour: rawDate?.hour ?? 0,
        minute: rawDate?.minute ?? 0,
        second: rawDate?.second ?? 0,
      }
      setRawDate(newRawDay);
    };

    // * Construct a single Date object from the rawDate object and timezone
    useEffect(() => {
      if (
        rawDate &&
        (rawDate.year || rawDate.month || rawDate.date || rawDate.hour || rawDate.minute || rawDate.second)
      ) {
        let newDate = dayjs().tz(timezone.value); // Start from now

        // Apply updates from rawDate
        Object.entries(rawDate).forEach(([unit, value]) => {
          if (value !== undefined && value !== null) {
            newDate = newDate.set(unit as dayjs.UnitType, value);
          }
        });
        const localEquivalent = dayjs(newDate.format("YYYY-MM-DDTHH:mm:ss")); // Workaround to stop .toDate() warping the time
        setDisplayDateTime(localEquivalent.toDate());

        onChange?.(newDate.toISOString());
      }
    }, [rawDate, timezone]);

    return (
      <Popover>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !displayDateTime && "text-muted-foreground",
              className
            )}
            ref={buttonRef}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayDateTime ? (
              `${format(
                displayDateTime,
                hourCycle === 24
                  ? displayFormat?.hour24 ??
                  `PPP HH:mm${!granularity || granularity === "second" ? ":ss" : ""}`
                  : displayFormat?.hour12 ??
                  `PP hh:mm${!granularity || granularity === "second" ? ":ss" : ""} b`,
                {
                  locale: locale as Locale,
                }
              )} ${timezone && `${timezone.label.split(" ")[1]}`}`
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={displayDateTime}
            month={displayDateTime}
            onSelect={(newDate) => {
              if (newDate) {
                setRawDate((prevRawDate) => ({
                  ...prevRawDate,
                  year: newDate.getFullYear(),
                  month: newDate.getMonth(),
                  date: newDate.getDate(),
                }))
              }
            }}
            onMonthChange={handleMonthChange}
            fromYear={new Date().getFullYear() - yearRange}
            toYear={new Date().getFullYear() + yearRange}
            locale={locale}
            {...props}
          />
          {granularity !== "day" && (
            <div className="border-t border-border p-3">
              <TimePicker
                onChange={(time) => {
                  if (time) {
                    setRawDate((prevRawDate) => ({
                      ...prevRawDate,
                      ...(time.hour !== undefined ? { hour: time.hour } : {}),
                      ...(time.minute !== undefined ? { minute: time.minute } : {}),
                      ...(time.second !== undefined ? { second: time.second } : {}),
                    }));
                  }
                }}
                displayTime={displayDateTime}
                hourCycle={hourCycle}
                granularity={granularity}
              />
            </div>
          )}
          {/* Conditionally render the timezone selector */}
          {props.showTimezone && (
            <Combobox
              title="Timezone"
              defaultValue={props.defaultTimezone}
              options={TIMEZONES}
              value={timezone}
              onChange={(newTimezone) => {
                if (newTimezone) {
                  setTimezone(newTimezone);
                  onTimezoneChange?.(newTimezone.value);
                }
              }}
              className="w-[230px] mb-3 mt-0 p-2 text-xs"
            />
          )}
        </PopoverContent>
      </Popover>
    );
  }
);

DateTimePicker.displayName = "DateTimePicker";

export { DateTimePicker, TimePicker, TimePickerInput };
export type { DateTimePickerProps, DateTimePickerRef, TimePickerType };

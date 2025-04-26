import { logout } from "@/store/features/auth/AuthSlice";
import { persistor } from "@/store/store";
import { clsx } from "clsx";
import { format, parse } from "date-fns";
import { toast } from "react-toastify";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export function transformTimesheetData(timesheets) {
  const attendanceData = {};

  timesheets.forEach((timesheet) => {
      // Remove extra fractional seconds from the string
      const checkInString = timesheet.check_in.replace(/\.\d+Z$/, '.000Z');
      const checkOutString = timesheet.check_out
          ? timesheet.check_out.replace(/\.\d+Z$/, '.000Z')
          : null;

      // Define the format of your input date-time string
      const inputFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";

      // Parse the string as a local time
      const checkInDate = parse(checkInString, inputFormat, new Date());
      const checkOutDate = checkOutString
          ? parse(checkOutString, inputFormat, new Date())
          : null;

      // Format the date as 'yyyy-MM-dd' for the key
      const dateKey = format(checkInDate, "yyyy-MM-dd");

      // Store check-in and check-out times
      attendanceData[dateKey] = {
          checkin: format(checkInDate, "hh:mm a"), // e.g., '09:15 AM'
          checkout: checkOutDate ? format(checkOutDate, "hh:mm a") : null, // e.g., '05:15 PM' or null
      };
  });

  return attendanceData;
}

export const handleAuthError = (error, dispatch, navigate) => {
  const errorStatus = error.response?.status;
  if (errorStatus === 403 || errorStatus === 401) {
    toast.error('Your session has expired. Please log in again.');
    persistor.purge();
    setTimeout(() => {
      navigate('/');
    }, 3000);
  } else {
    console.error('API Error:', error);
  }
};
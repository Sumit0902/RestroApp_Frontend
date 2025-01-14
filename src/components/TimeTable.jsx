import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, eachWeekOfInterval } from 'date-fns';
import { AttendanceTable } from './AttendanceTable.jsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function TimeTable() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [weeks, setWeeks] = useState([]);
  const [allowedPrevMonth] = useState(1);
  const [allowedNextMonth] = useState(1);


  const updateCalendar = (month) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    const weeksInterval = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });
    const weeks = weeksInterval.map((weekStart) => {
      const weekRange = {
        start: startOfWeek(weekStart, { weekStartsOn: 1 }),
        end: endOfWeek(weekStart, { weekStartsOn: 1 }),
      };
      return eachDayOfInterval(weekRange);
    });

    setWeeks(weeks);
  };

 const nextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    const currentPlusAllowed = new Date();
    currentPlusAllowed.setMonth(currentPlusAllowed.getMonth() + allowedNextMonth);

    if (next <= currentPlusAllowed) {
      setCurrentMonth(next);
    }
  };

  const prevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const currentMinusAllowed = new Date();
    currentMinusAllowed.setMonth(currentMinusAllowed.getMonth() - allowedPrevMonth);

    if (prev >= currentMinusAllowed) {
      setCurrentMonth(prev);
    }
  };

  useEffect(() => {
    updateCalendar(currentMonth);
  }, [currentMonth]);

  const formattedMonth = format(currentMonth, "MMMM yyyy");
  
  const attendanceData = {
    "2024-03-18": { checkin: "09:00 AM", checkout: "05:00 PM" },
    "2024-03-19": { checkin: "09:15 AM", checkout: "05:30 PM" },
    "2024-03-20": { checkin: "09:00 AM" }, // Missing checkout
    // Past dates with no attendance (will show as ABSENT)
    "2024-03-15": {},
    "2024-03-14": {},
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-center items-center">
        <button onClick={prevMonth}><ChevronLeft title="Previous Month" className='mx-8 w-12 h-12'/></button>
        <h1>{formattedMonth}</h1>
        <button onClick={nextMonth}><ChevronRight title="Next Month" className='mx-8 w-12 h-12'/></button>
      </div>
      <div className="flex flex-col gap-8">
        {weeks.map((weekDates, index) => (
          <AttendanceTable
            key={index}
            weekDates={weekDates}
            weekNumber={index + 1}
            attendanceData={attendanceData}
            currentMonth={currentMonth}
          />
        ))}
      </div>
    </div>
  );
}

export default TimeTable;

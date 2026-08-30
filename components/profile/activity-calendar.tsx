'use client';

import React, { useState, useMemo } from 'react';
import { CheckInLog } from '@/types/ember';
import {
  Flame,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  CalendarDays,
  Columns3,
} from 'lucide-react';

interface ActivityCalendarProps {
  logs: CheckInLog[];
  userId: string;
  completedTodayHabitIds: string[];
}

interface MonthDay {
  dayNumber: number;
  dateStr: string; // YYYY-MM-DD
  count: number;
  level: number;
  isToday: boolean;
  isFuture: boolean;
  formattedDate: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function ActivityCalendar({
  logs,
  userId,
  completedTodayHabitIds,
}: ActivityCalendarProps) {
  const [hoveredDay, setHoveredDay] = useState<MonthDay | null>(null);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIndex);
  // viewMode: 'current' (single month, default) | 'remaining' (current to Dec) | 'full' (all 12 months)
  const [viewMode, setViewMode] = useState<'current' | 'remaining' | 'full'>('current');

  // Map check-ins per YYYY-MM-DD
  const logsCountByDate = useMemo(() => {
    const map: Record<string, number> = {};

    logs.forEach((log) => {
      if (log.userId === userId || !userId) {
        map[log.loggedDate] = (map[log.loggedDate] || 0) + 1;
      }
    });

    // Today's completed habits
    const todayStr = new Date().toISOString().split('T')[0];
    if (completedTodayHabitIds.length > 0) {
      map[todayStr] = Math.max(map[todayStr] || 0, completedTodayHabitIds.length);
    }

    return map;
  }, [logs, userId, completedTodayHabitIds]);

  // Generate 12 months (Jan -> Dec) for selectedYear
  const { monthsData, totalCheckIns, activeDaysCount, maxStreak } = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    let total = 0;
    let activeDays = 0;
    let currentStreakCount = 0;
    let maxStreakRecorded = 0;

    const months = Array.from({ length: 12 }, (_, monthIdx) => {
      const firstDay = new Date(selectedYear, monthIdx, 1);
      const startingDayOfWeek = firstDay.getDay(); // 0 = Sun
      const daysInMonth = new Date(selectedYear, monthIdx + 1, 0).getDate();

      const days: (MonthDay | null)[] = [];

      // Leading blanks
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }

      // Days of the month
      for (let d = 1; d <= daysInMonth; d++) {
        const monthNum = String(monthIdx + 1).padStart(2, '0');
        const dayNum = String(d).padStart(2, '0');
        const dateStr = `${selectedYear}-${monthNum}-${dayNum}`;
        const count = logsCountByDate[dateStr] || 0;

        const dayDate = new Date(selectedYear, monthIdx, d);
        const isFuture = dayDate > today;

        let level = 0;
        if (count === 1) level = 1;
        else if (count === 2) level = 2;
        else if (count === 3) level = 3;
        else if (count >= 4) level = 4;

        if (count > 0) {
          total += count;
          activeDays += 1;
          currentStreakCount += 1;
          if (currentStreakCount > maxStreakRecorded) {
            maxStreakRecorded = currentStreakCount;
          }
        } else if (!isFuture) {
          currentStreakCount = 0;
        }

        days.push({
          dayNumber: d,
          dateStr,
          count,
          level,
          isToday: dateStr === todayStr,
          isFuture,
          formattedDate: new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }).format(dayDate),
        });
      }

      return {
        monthName: MONTH_NAMES[monthIdx],
        monthShort: MONTH_NAMES[monthIdx].substring(0, 3),
        monthIndex: monthIdx,
        days,
      };
    });

    return {
      monthsData: months,
      totalCheckIns: total,
      activeDaysCount: activeDays,
      maxStreak: maxStreakRecorded,
    };
  }, [selectedYear, logsCountByDate]);

  // Filter displayed months depending on View Mode ('current' vs 'remaining' vs 'full')
  const displayedMonths = useMemo(() => {
    if (viewMode === 'current') {
      const activeMonth = selectedYear === currentYear ? selectedMonth : 0;
      return [monthsData[activeMonth] || monthsData[0]];
    }
    if (viewMode === 'remaining') {
      if (selectedYear === currentYear) {
        return monthsData.filter((m) => m.monthIndex >= currentMonthIndex);
      }
      return monthsData;
    }
    return monthsData; // 'full'
  }, [monthsData, viewMode, selectedYear, currentYear, selectedMonth, currentMonthIndex]);

  const getCellClasses = (day: MonthDay) => {
    if (day.isFuture) {
      return 'bg-zinc-900/30 border border-zinc-800/30 text-zinc-700 opacity-40 cursor-default';
    }

    if (day.level === 1) {
      return 'bg-emerald-900/90 border border-emerald-700/70 text-emerald-200 hover:bg-emerald-800 shadow-sm';
    }
    if (day.level === 2) {
      return 'bg-emerald-700 border border-emerald-500/80 text-white hover:bg-emerald-600 shadow-sm';
    }
    if (day.level === 3) {
      return 'bg-emerald-500 border border-emerald-400 text-zinc-950 hover:bg-emerald-400 font-bold shadow-md shadow-emerald-500/20';
    }
    if (day.level >= 4) {
      return 'bg-emerald-400 border border-emerald-300 text-zinc-950 hover:bg-emerald-300 font-extrabold shadow-lg shadow-emerald-400/30';
    }

    // Level 0 (no check-ins)
    if (day.isToday) {
      return 'bg-zinc-900 border border-orange-500 text-orange-400 font-bold hover:border-orange-400';
    }

    return 'bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/50';
  };

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 space-y-5">
      {/* Header with Title and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div>
          <h3 className="text-base font-extrabold text-zinc-100 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-orange-400" />
            <span>
              {viewMode === 'current'
                ? `${MONTH_NAMES[selectedMonth]} ${selectedYear} Habit Activity`
                : viewMode === 'remaining' && selectedYear === currentYear
                ? `${selectedYear} Activity (${MONTH_NAMES[currentMonthIndex].substring(0, 3)} – Dec)`
                : `${selectedYear} Habit Activity (Full Year)`}
            </span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            {viewMode === 'current'
              ? `Daily habit consistency tracker for ${MONTH_NAMES[selectedMonth]}`
              : `Showing ${displayedMonths.length} month${displayedMonths.length === 1 ? '' : 's'} • ${totalCheckIns} check-in${totalCheckIns === 1 ? '' : 's'} in ${selectedYear}`}
          </p>
        </div>

        {/* View Mode Options: Current Month | Current -> Dec | Full Year */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 text-xs font-semibold">
            {/* Option 1: Current Month (Default) */}
            <button
              onClick={() => {
                setViewMode('current');
                setSelectedMonth(currentMonthIndex);
              }}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'current'
                  ? 'bg-zinc-800 text-orange-400 shadow-sm font-bold border border-zinc-700/60'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Current Month</span>
            </button>

            {/* Option 2: Remaining Months */}
            <button
              onClick={() => setViewMode('remaining')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'remaining'
                  ? 'bg-zinc-800 text-orange-400 shadow-sm font-bold border border-zinc-700/60'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>{MONTH_NAMES[currentMonthIndex].substring(0, 3)} → Dec</span>
            </button>

            {/* Option 3: Full Year */}
            <button
              onClick={() => setViewMode('full')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'full'
                  ? 'bg-zinc-800 text-orange-400 shadow-sm font-bold border border-zinc-700/60'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Year (12M)</span>
            </button>
          </div>

          {/* Year Navigator */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setSelectedYear((y) => y - 1)}
              className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="Previous Year"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 font-bold text-orange-400">{selectedYear}</span>
            <button
              onClick={() => setSelectedYear((y) => y + 1)}
              disabled={selectedYear >= currentYear}
              className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
              title="Next Year"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-center">
        <div>
          <span className="text-[10px] uppercase font-bold text-zinc-500 block">
            {viewMode === 'current' ? `Check-ins (${MONTH_NAMES[selectedMonth].substring(0, 3)})` : `Check-ins in ${selectedYear}`}
          </span>
          <span className="text-base sm:text-lg font-black text-emerald-400">
            {viewMode === 'current'
              ? displayedMonths[0]?.days.filter((d) => d && d.count > 0).reduce((acc, d) => acc + (d?.count || 0), 0) || 0
              : totalCheckIns}
          </span>
        </div>
        <div className="border-x border-zinc-800/80">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block">
            Active Days
          </span>
          <span className="text-base sm:text-lg font-black text-zinc-100">
            {viewMode === 'current'
              ? displayedMonths[0]?.days.filter((d) => d && d.count > 0).length || 0
              : activeDaysCount}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-zinc-500 block">
            Max Streak
          </span>
          <span className="text-base sm:text-lg font-black text-orange-400 flex items-center justify-center gap-1">
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
            {maxStreak}d
          </span>
        </div>
      </div>

      {/* Single Month View Mode (Centered, high-craft presentation) */}
      {viewMode === 'current' ? (
        <div className="max-w-md mx-auto p-4 sm:p-5 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 shadow-xl space-y-3">
          {/* Month & Month Switcher */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedMonth((m) => (m === 0 ? 11 : m - 1))}
              className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center">
              <h4 className="text-sm font-extrabold text-white">
                {MONTH_NAMES[selectedMonth]} {selectedYear}
              </h4>
            </div>
            <button
              onClick={() => setSelectedMonth((m) => (m === 11 ? 0 : m + 1))}
              className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Initials Header (S M T W T F S) */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-zinc-500 py-1">
            {WEEKDAY_INITIALS.map((initial, i) => (
              <span key={i} className="h-4 flex items-center justify-center">
                {initial}
              </span>
            ))}
          </div>

          {/* 7-column Calendar Grid for Single Month */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {displayedMonths[0]?.days.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="w-full aspect-square" />;
              }

              return (
                <div
                  key={day.dateStr}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`w-full aspect-square rounded-md sm:rounded-lg transition-all duration-150 cursor-pointer select-none ${getCellClasses(
                    day
                  )}`}
                />
              );
            })}
          </div>
        </div>
      ) : (
        /* Multi-Month Grid (Jan to Dec or Current Month to Dec) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedMonths.map((month) => {
            const isCurrentMonth =
              selectedYear === currentYear && month.monthIndex === currentMonthIndex;

            return (
              <div
                key={month.monthName}
                className={`p-3 rounded-2xl border transition-all ${
                  isCurrentMonth
                    ? 'bg-zinc-900/60 border-orange-500/40 shadow-lg shadow-orange-500/5 ring-1 ring-orange-500/20'
                    : 'bg-zinc-900/30 border-zinc-800/70'
                } space-y-2`}
              >
                {/* Month Header */}
                <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
                  <div className="flex items-center gap-1.5">
                    <span>{month.monthName}</span>
                    {isCurrentMonth && (
                      <span className="text-[9px] bg-orange-500/20 text-orange-400 px-1.5 py-0.2 rounded font-bold">
                        Current
                      </span>
                    )}
                  </div>
                </div>

                {/* Weekday Initials Header (S M T W T F S) */}
                <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-zinc-500">
                  {WEEKDAY_INITIALS.map((initial, i) => (
                    <span key={i} className="h-3 flex items-center justify-center">
                      {initial}
                    </span>
                  ))}
                </div>

                {/* 7-column Calendar Grid for the month */}
                <div className="grid grid-cols-7 gap-1">
                  {month.days.map((day, idx) => {
                    if (!day) {
                      return <div key={`empty-${idx}`} className="w-full aspect-square" />;
                    }

                    return (
                      <div
                        key={day.dateStr}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-full aspect-square rounded-[4px] transition-all duration-150 cursor-pointer select-none ${getCellClasses(
                          day
                        )}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer: Dynamic Hover Details & Intensity Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800/80 text-xs">
        {/* Hovered Day Status */}
        <div className="text-zinc-300 min-h-[22px] flex items-center gap-1.5">
          {hoveredDay ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-emerald-400">
                {hoveredDay.count} check-in{hoveredDay.count === 1 ? '' : 's'}
              </span>
              <span className="text-zinc-500">on</span>
              <span className="text-zinc-200">{hoveredDay.formattedDate}</span>
              {hoveredDay.isToday && (
                <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.2 rounded font-bold">
                  Today
                </span>
              )}
            </>
          ) : (
            <span className="text-zinc-500 text-[11px]">
              Hover over any day to see date and completed rituals
            </span>
          )}
        </div>

        {/* LeetCode / Green Intensity Legend */}
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 select-none">
          <span>0</span>
          <div className="w-3 h-3 rounded-[3px] bg-zinc-900 border border-zinc-800" />
          <div className="w-3 h-3 rounded-[3px] bg-emerald-900 border border-emerald-700/60" />
          <div className="w-3 h-3 rounded-[3px] bg-emerald-700 border border-emerald-500/80" />
          <div className="w-3 h-3 rounded-[3px] bg-emerald-500 border border-emerald-400" />
          <div className="w-3 h-3 rounded-[3px] bg-emerald-400 border border-emerald-300" />
          <span>4+</span>
        </div>
      </div>
    </div>
  );
}

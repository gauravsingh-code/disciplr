'use client';

import React, { useState, useEffect } from 'react';
import { Habit, FrequencyType } from '@/types/ember';
import { useEmber } from '@/context/ember-context';
import { HABIT_TEMPLATES } from '@/lib/mock-data';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Clock, Lock, Calendar } from 'lucide-react';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitToEdit?: Habit | null;
}

// Convert "08:00 AM" / "08:30 PM" to "08:00" / "20:30" (for <input type="time" />)
function to24Hour(timeStr: string): string {
  if (!timeStr) return '08:00';
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return timeStr.length === 5 ? timeStr : '08:00';
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3]?.toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

// Convert "20:30" back to clean "08:30 PM" (for storage and database)
function to12Hour(time24: string): string {
  if (!time24) return '08:00 AM';
  const [hStr, mStr] = time24.split(':');
  let hours = parseInt(hStr, 10);
  const minutes = mStr || '00';
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;
}

function formatDisplayTime(timeStr: string): string {
  return to12Hour(to24Hour(timeStr));
}

export function HabitModal({
  isOpen,
  onClose,
  habitToEdit,
}: HabitModalProps) {
  const { createHabit, updateHabit } = useEmber();

  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('🔥');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [timesPerWeek, setTimesPerWeek] = useState(4);
  const [reminderTime, setReminderTime] = useState('08:00 AM');
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title);
      setEmoji(habitToEdit.emoji);
      setFrequencyType(habitToEdit.frequency.type);
      setSelectedDays(habitToEdit.frequency.daysOfWeek || [1, 2, 3, 4, 5]);
      setTimesPerWeek(habitToEdit.frequency.timesPerWeek || 4);
      setReminderTime(habitToEdit.reminderTime);
      setIsPrivate(habitToEdit.isPrivate);
    } else {
      setTitle('');
      setEmoji('⚡');
      setFrequencyType('daily');
      setSelectedDays([1, 2, 3, 4, 5]);
      setTimesPerWeek(4);
      setReminderTime('08:00 AM');
      setIsPrivate(false);
    }
  }, [habitToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const frequency = {
      type: frequencyType,
      daysOfWeek: frequencyType === 'specific_days' ? selectedDays : undefined,
      timesPerWeek: frequencyType === 'times_per_week' ? timesPerWeek : undefined,
    };

    if (habitToEdit) {
      updateHabit(habitToEdit.id, {
        title,
        emoji,
        frequency,
        reminderTime,
        isPrivate,
        sharedPodIds: isPrivate ? [] : (habitToEdit.sharedPodIds || []),
      });
    } else {
      createHabit({
        title,
        emoji,
        frequency,
        reminderTime,
        isPrivate,
        sharedPodIds: [],
      });
    }

    onClose();
  };

  const applyTemplate = (template: { title: string; emoji: string; defaultTime: string }) => {
    setTitle(template.title);
    setEmoji(template.emoji);
    setReminderTime(template.defaultTime);
  };

  const toggleDay = (dayIndex: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const daysLabel = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={habitToEdit ? 'Edit Habit' : 'Create New Habit'}
      description="Define your daily discipline. Track your progress with streaks and forgiving shields."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Quick Templates (Only when creating) */}
        {!habitToEdit && (
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Quick Templates
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
              {HABIT_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.title}
                  type="button"
                  onClick={() => applyTemplate(tmpl)}
                  className="shrink-0 text-xs px-2.5 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border border-zinc-700/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{tmpl.emoji}</span>
                  <span>{tmpl.title.split(' (')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Emoji & Title */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Habit Name & Emoji
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-14 text-center text-xl p-2.5 bg-zinc-800/90 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-none focus:border-orange-500"
              maxLength={2}
            />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning 5k Run, Read 20 pages..."
              required
              className="flex-1 px-3.5 py-2.5 bg-zinc-800/90 border border-zinc-700 rounded-xl text-zinc-100 placeholder:text-zinc-500 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Frequency Selector */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-orange-400" />
            Frequency Schedule
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'daily', label: 'Every Day' },
              { id: 'specific_days', label: 'Specific Days' },
              { id: 'times_per_week', label: 'Times / Wk' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFrequencyType(f.id as FrequencyType)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  frequencyType === f.id
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700/60'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Specific Days Picker */}
          {frequencyType === 'specific_days' && (
            <div className="flex gap-1 mt-2.5">
              {daysLabel.map((day, idx) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(idx)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    selectedDays.includes(idx)
                      ? 'bg-orange-500 text-zinc-950 font-bold'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          )}

          {/* Times Per Week Slider */}
          {frequencyType === 'times_per_week' && (
            <div className="mt-2.5 flex items-center gap-3 bg-zinc-800/80 p-3 rounded-xl border border-zinc-700">
              <span className="text-xs text-zinc-400">Target per week:</span>
              <input
                type="range"
                min={1}
                max={6}
                value={timesPerWeek}
                onChange={(e) => setTimesPerWeek(parseInt(e.target.value))}
                className="flex-1 accent-orange-500"
              />
              <span className="text-xs font-bold text-orange-400">
                {timesPerWeek} days / week
              </span>
            </div>
          )}
        </div>

        {/* Reminder Time (hidden for now)
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              Daily Reminder Time
            </span>
            <span className="text-[11px] text-zinc-400 font-normal">
              Formatted: {formatDisplayTime(reminderTime)}
            </span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={to24Hour(reminderTime)}
              onChange={(e) => {
                if (e.target.value) {
                  setReminderTime(to12Hour(e.target.value));
                }
              }}
              required
              className="flex-1 px-3.5 py-2.5 bg-zinc-800/90 border border-zinc-700 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-orange-500 cursor-pointer [color-scheme:dark]"
            />
            {['07:00 AM', '12:00 PM', '08:00 PM'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setReminderTime(preset)}
                className={`text-xs px-2.5 py-2.5 rounded-xl border transition-colors cursor-pointer ${
                  reminderTime === preset
                    ? 'bg-orange-500/20 border-orange-500/50 text-orange-300 font-bold'
                    : 'bg-zinc-800/80 hover:bg-zinc-700/80 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {preset.replace(':00', '')}
              </button>
            ))}
          </div>
        </div>
        */}

        {/* Privacy Toggle */}
        <div className="p-3.5 rounded-xl bg-zinc-800/50 border border-zinc-700/80 space-y-3">
          <Switch
            checked={isPrivate}
            onChange={setIsPrivate}
            label="Make this habit Private"
            description="If enabled, check-ins will remain private to your personal dashboard."
          />
        </div>

        {/* Submit */}
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
          >
            {habitToEdit ? 'Save Changes' : 'Create Habit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

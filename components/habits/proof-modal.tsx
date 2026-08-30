'use client';

import React, { useState } from 'react';
import { Habit } from '@/types/ember';
import { useEmber } from '@/context/ember-context';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Camera, Image as ImageIcon, Sparkles, MessageSquare, Check } from 'lucide-react';

interface ProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
}

const PHOTO_PRESETS = [
  {
    label: 'Workout / Run',
    url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Reading / Book',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Deep Work Desk',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Yoga / Mat',
    url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Hydration / Water',
    url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80',
  },
];

export function ProofModal({ isOpen, onClose, habit }: ProofModalProps) {
  const { toggleCheckIn, completedTodayHabitIds } = useEmber();
  const [photoUrl, setPhotoUrl] = useState('');
  const [note, setNote] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState('');

  if (!habit) return null;

  const isAlreadyCompleted = completedTodayHabitIds.includes(habit.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPhoto = photoUrl || (customUrlInput.trim() ? customUrlInput.trim() : undefined);

    // If not completed yet or if updating proof
    if (!isAlreadyCompleted) {
      toggleCheckIn(habit.id, {
        proofImageUrl: finalPhoto,
        note: note.trim() || undefined,
      });
    } else {
      // Re-trigger with proof
      toggleCheckIn(habit.id); // toggles off
      setTimeout(() => {
        toggleCheckIn(habit.id, {
          proofImageUrl: finalPhoto,
          note: note.trim() || undefined,
        });
      }, 50);
    }

    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-orange-400" />
          <span>Add Check-In Proof & Note</span>
        </div>
      }
      description={`Share lightweight context for "${habit.emoji} ${habit.title}" with your Pod.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo Selection / Presets */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
            <span>Attach Photo Proof (Optional)</span>
            <span className="text-[11px] text-zinc-500 font-normal">
              Proof, not performance
            </span>
          </label>

          {/* Photo Preview if Selected */}
          {photoUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-orange-500/40 mb-3 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt="Proof preview"
                className="w-full h-44 object-cover"
              />
              <button
                type="button"
                onClick={() => setPhotoUrl('')}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black text-xs text-zinc-200 px-2.5 py-1 rounded-lg backdrop-blur-sm cursor-pointer"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Upload input */}
              <label className="flex flex-col items-center justify-center p-4 border border-dashed border-zinc-700 hover:border-orange-500/50 rounded-xl bg-zinc-800/40 hover:bg-zinc-800/70 transition-all cursor-pointer">
                <ImageIcon className="w-6 h-6 text-zinc-400 mb-1" />
                <span className="text-xs font-medium text-zinc-300">
                  Upload screenshot or photo
                </span>
                <span className="text-[10px] text-zinc-500 mt-0.5">
                  PNG, JPG or WebP (max 5MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Sample Presets */}
              <div className="pt-1">
                <span className="text-[11px] text-zinc-400 block mb-1.5 font-medium">
                  Or pick a sample photo:
                </span>
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {PHOTO_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setPhotoUrl(preset.url)}
                      className="shrink-0 text-xs px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/80 transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reflection Note */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
              Daily Reflection Note (Optional)
            </span>
            <span className="text-[10px] text-zinc-400">
              {note.length}/200 chars
            </span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 200))}
            placeholder="How did this session go? Any wins or thoughts to share with your Pod?"
            rows={3}
            className="w-full px-3.5 py-2.5 bg-zinc-800/90 border border-zinc-700 rounded-xl text-zinc-100 placeholder:text-zinc-500 text-xs focus:outline-none focus:border-orange-500 resize-none"
          />
        </div>

        {/* Actions */}
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
            variant="glow"
            fullWidth
            leftIcon={<Check className="w-4 h-4" />}
          >
            Log & Share Check-In
          </Button>
        </div>
      </form>
    </Modal>
  );
}

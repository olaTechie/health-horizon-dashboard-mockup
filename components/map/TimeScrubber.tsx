'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';

const SPEED_OPTIONS = [1, 4, 8, 16] as const;
type PlaySpeed = typeof SPEED_OPTIONS[number];

// Steps per tick at 1× speed: 6 hours = 6 * 60 * 60 * 1000 ms
const BASE_STEP_MS = 6 * 60 * 60 * 1000;
// Tick interval in ms
const TICK_INTERVAL_MS = 200;

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface TimeScrubberProps {
  scrubberDate: Date;
  onChange: (date: Date) => void;
  playSpeed: PlaySpeed;
  onSpeedChange: (speed: PlaySpeed) => void;
}

export function TimeScrubber({ scrubberDate, onChange, playSpeed, onSpeedChange }: TimeScrubberProps) {
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const now = useRef(Date.now()).current;
  const startMs = now - NINETY_DAYS_MS;
  const endMs = now;

  const currentMs = scrubberDate.getTime();
  const progress = ((currentMs - startMs) / NINETY_DAYS_MS) * 100;

  function stop() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function reset() {
    stop();
    setPlaying(false);
    onChange(new Date(startMs));
  }

  function handlePlay() {
    if (playing) {
      stop();
      setPlaying(false);
    } else {
      // If at end, reset first
      if (currentMs >= endMs) {
        onChange(new Date(startMs));
      }
      setPlaying(true);
    }
  }

  // Keep a ref to the current scrubberDate for use inside setInterval
  const scrubberDateRef = useRef(scrubberDate);
  scrubberDateRef.current = scrubberDate;

  // Advance timer
  useEffect(() => {
    if (!playing) {
      stop();
      return;
    }

    intervalRef.current = setInterval(() => {
      const stepMs = BASE_STEP_MS * playSpeed;
      const nextMs = scrubberDateRef.current.getTime() + stepMs;
      if (nextMs >= endMs) {
        setPlaying(false);
        onChange(new Date(endMs));
      } else {
        onChange(new Date(nextMs));
      }
    }, TICK_INTERVAL_MS);

    return stop;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, playSpeed]);

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    const ms = startMs + (v / 100) * NINETY_DAYS_MS;
    onChange(new Date(ms));
  }

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-10 h-20 flex items-center gap-4 px-6
                 bg-[var(--surface)]/95 backdrop-blur-sm border-t border-[var(--border)]"
      aria-label="Time scrubber"
    >
      {/* Play / Pause */}
      <button
        onClick={handlePlay}
        className="flex items-center justify-center size-8 rounded-full border border-[var(--border)] bg-[var(--panel)]
                   hover:bg-[var(--border)] transition-colors shrink-0"
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? <Pause size={14} className="text-[var(--ink)]" /> : <Play size={14} className="text-[var(--ink)]" />}
      </button>

      {/* Reset */}
      <button
        onClick={reset}
        className="flex items-center justify-center size-8 rounded-full border border-[var(--border)] bg-[var(--panel)]
                   hover:bg-[var(--border)] transition-colors shrink-0"
        aria-label="Reset to 90 days ago"
      >
        <RotateCcw size={13} className="text-[var(--ink-secondary)]" />
      </button>

      {/* Speed selector */}
      <div className="flex items-center gap-1 shrink-0">
        {SPEED_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={cn(
              'px-2 py-0.5 rounded text-[10px] font-mono border transition-colors',
              playSpeed === s
                ? 'bg-[var(--tier-watch)] text-white border-[var(--tier-watch)]'
                : 'bg-[var(--panel)] text-[var(--ink-secondary)] border-[var(--border)] hover:border-[var(--ink-secondary)]',
            )}
            aria-label={`${s}x speed`}
            aria-pressed={playSpeed === s}
          >
            {s}×
          </button>
        ))}
      </div>

      {/* Slider track */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[var(--ink-tertiary)]">
            {formatDate(new Date(startMs))}
          </span>
          <span className="font-mono text-[11px] text-[var(--ink)] font-semibold">
            {formatDate(scrubberDate)}
          </span>
          <span className="font-mono text-[10px] text-[var(--ink-tertiary)]">
            {formatDate(new Date(endMs))}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={progress.toFixed(1)}
          onChange={handleSlider}
          className="w-full h-1.5 rounded-full accent-[var(--tier-watch)] cursor-pointer"
          aria-label="Time position"
        />
      </div>
    </div>
  );
}

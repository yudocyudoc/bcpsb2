import { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface SlidermobProps {
  value?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  label?: string;
  id?: string;
}

const Slidermob: React.FC<SlidermobProps> = ({
  value: initialValue = 50,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  label,
  id
}) => {
  const [value, setValue] = useState<number>(initialValue);
  const sliderRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const preventDefaultTouch = (e: TouchEvent | MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const calculateThumbPosition = (clientX: number) => {
    if (!sliderRef.current) return;

    const slider = sliderRef.current;
    const sliderRect = slider.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100,
      ((clientX - sliderRect.left) / sliderRect.width) * 100
    ));

    const newValue = min + (percentage / 100) * (max - min);
    const roundedValue = Math.round(newValue / step) * step;

    return {
      percentage,
      value: Math.max(min, Math.min(max, roundedValue))
    };
  };

  const handleChange = (newValue: number) => {
    setValue(newValue);
    onValueChange && onValueChange(newValue);
  };

  useEffect(() => {
    const thumb = thumbRef.current;
    const slider = sliderRef.current;

    if (!thumb || !slider) return;

    const handleStart = (e: TouchEvent | MouseEvent) => {
      isDragging.current = true;
      preventDefaultTouch(e);
      const clientX = (e as TouchEvent).touches ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const result = calculateThumbPosition(clientX);
      if (result) handleChange(result.value);
    };

    const handleMove = (e: TouchEvent | MouseEvent) => {
      if (!isDragging.current) return;
      preventDefaultTouch(e);
      const clientX = (e as TouchEvent).touches ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const result = calculateThumbPosition(clientX);
      if (result) handleChange(result.value);
    };

    const handleEnd = () => {
      isDragging.current = false;
    };

    slider.addEventListener('touchstart', handleStart, { passive: false });
    slider.addEventListener('touchmove', handleMove, { passive: false });
    slider.addEventListener('mousedown', handleStart, { passive: false });
    window.addEventListener('mousemove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleEnd, { passive: false });
    slider.addEventListener('touchend', handleEnd, { passive: false });

    return () => {
      slider.removeEventListener('touchstart', handleStart);
      slider.removeEventListener('touchmove', handleMove);
      slider.removeEventListener('mousedown', handleStart);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      slider.removeEventListener('touchend', handleEnd);
    };
  }, [min, max, step]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      <div
        ref={sliderRef}
        id={id}
        className={cn(
          "relative w-full h-2 bg-gray-200 rounded-full touch-none select-none",
          className
        )}
      >
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />

        <div
          ref={thumbRef}
          className="absolute -top-1.5 w-5 h-5 bg-blue-600 rounded-full shadow-md cursor-pointer"
          style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
        />
      </div>

      <div className="text-sm text-gray-600 mt-2 text-right">
        {value}%
      </div>
    </div>
  );
};

export default Slidermob;

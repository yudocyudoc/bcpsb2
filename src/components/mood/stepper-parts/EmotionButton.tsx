// src/components/mood/stepper-parts/EmotionButton.tsx
import React from 'react';
import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ButtonProps = ComponentProps<typeof Button>;

interface EmotionButtonProps extends Omit<ButtonProps, 'onClick' | 'variant' | 'aria-pressed'> {
  emotionName: string;
  isSelected: boolean;
  onClick: () => void;
  size?: ButtonProps['size'];
  className?: string;
}

export const EmotionButton: React.FC<EmotionButtonProps> = ({
  emotionName,
  isSelected,
  onClick,
  size = "default", // 'default' o 'sm'
  className,
  ...props // Resto de props para el botón
}) => {
  return (
    <Button
      type="button"
      variant={isSelected ? "default" : "secondary"}
      onClick={onClick}
      aria-pressed={isSelected}
      size={size}
      className={cn("transition-all", className)} // Añadir clases adicionales si es necesario
      {...props}
    >
      {emotionName}
    </Button>
  );
};
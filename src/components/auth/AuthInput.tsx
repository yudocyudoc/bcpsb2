// src/components/auth/AuthInput.tsx
import React, { useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Icons } from '@/components/ui/icons'; // Importa tu objeto Icons
import { cn } from '@/lib/utils';

interface AuthInputProps extends ComponentPropsWithoutRef<'input'> {
  label?: string; // Hacer el label opcional
  id: string;
  icon?: keyof typeof Icons; // Permite pasar el nombre de un icono de tu objeto Icons
  containerClassName?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  id, // Ahora es opcional
  type = "text",
  icon,
  containerClassName,
  className,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  // Esta línea es crucial:
  const IconComponent = icon && typeof icon === 'string' && icon in Icons ? Icons[icon as keyof typeof Icons] as React.ElementType : null;

  const togglePasswordVisibility = () => {
    if (isPassword) {
      setShowPassword(!showPassword);
    }
  };

  return (
    <div className={cn("space-y-1.5", containerClassName)}> {/* space-y-1.5 o space-y-1 */}
      {label && ( /* Renderizar Label solo si existe */
        <Label htmlFor={id} className="text-sm font-medium"> {/* text-sm font-medium */}
          {label}
        </Label>
      )}
      <div className="relative">
        {IconComponent && (
          <IconComponent className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
          // ^^^ pointer-events-none para que no interfiera con el click en el input
        )}
        <Input
          id={id}
          type={isPassword && showPassword ? "text" : type}
          className={cn(
            "h-10", // Altura fija para el input
            IconComponent ? "pl-10" : "pl-3", // Padding izquierdo condicional
            isPassword ? "pr-10" : "pr-3", // Padding derecho condicional
            className
          )}
          {...props}
        />
        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            size="icon" // Para hacerlo cuadrado y más pequeño
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
            // ^^^ Ajustado tamaño y posición
            onClick={togglePasswordVisibility}
            disabled={props.disabled}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            tabIndex={-1} // Para que no sea enfocable por Tab, solo por click
          >
            {showPassword ? <Icons.EyeOff className="h-4 w-4" /> : <Icons.Eye className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  );
};
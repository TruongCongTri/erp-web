"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Eye, EyeOff } from "lucide";
import { MorphIcon } from "morphicons/react";
import { UseFormRegisterReturn } from "react-hook-form";

interface PasswordInputProps {
  id: string;
  label: string;
  placeholder?: string;
  error?: string;
  tabIndex?: number;
  registration: UseFormRegisterReturn;
}

export default function PasswordInput({
  id,
  label,
  placeholder,
  error,
  tabIndex,
  registration,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-bold text-foreground">
        {label}
      </label>
      <div className="relative group">
        <Lock
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
            error
              ? "text-red-500"
              : "text-muted-foreground group-focus-within:text-primary"
          }`}
        />

        <input
          {...registration}
          id={id}
          type={showPassword ? "text" : "password"}
          tabIndex={tabIndex}
          autoComplete="current-password"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          placeholder={placeholder}
          className={`w-full pl-10 py-2.5 lg:py-3 bg-background border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
            error
              ? "border-red-500 focus:ring-red-500/20 pr-32" // Extra padding so text doesn't hit the error message
              : "border-border focus:border-primary focus:ring-primary/20 hover:border-primary/50 pr-10" // Padding for the eye icon
          }`}
        />
        
        {/* Error Message - Shifted to right-10 to avoid overlapping the eye icon */}
        {error && (
          <span
            id={`${id}-error`}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-500 pointer-events-none bg-background/90 backdrop-blur-sm pl-2 truncate max-w-[40%] text-right animate-in fade-in"
            title={error}
          >
            {error}
          </span>
        )}

        <button
          type="button"
          tabIndex={-1} // Prevent tab from stopping on the icon
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-expanded={showPassword}
        >
          <MorphIcon icon={showPassword ? Eye : EyeOff} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
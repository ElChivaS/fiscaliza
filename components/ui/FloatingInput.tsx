"use client"

import { useState, type InputHTMLAttributes } from "react"

interface FloatingInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "placeholder"> {
  label:        string
  value:        string
  onChange:     (value: string) => void
  placeholder?: string  // ejemplo de formato, aparece recién cuando el label sube
  hint?:        string
  error?:       string | null
}

export default function FloatingInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  className,
  onFocus,
  onBlur,
  ...inputProps
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false)
  const floated = focused || value.length > 0

  return (
    <div>
      <div className="relative h-12">
        <label
          className={[
            "pointer-events-none absolute left-0 transition-all duration-150",
            floated
              ? `top-0 text-[11px] font-medium ${error ? "text-expired" : "text-muted"}`
              : "top-1/2 -translate-y-1/2 text-sm text-placeholder",
          ].join(" ")}
        >
          {label}
        </label>
        <input
          {...inputProps}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => { setFocused(true); onFocus?.(e) }}
          onBlur={(e) => { setFocused(false); onBlur?.(e) }}
          placeholder={floated ? placeholder : ""}
          className={[
            "h-12 w-full border-0 border-b bg-transparent pt-4 pb-1.5 text-sm text-ink transition-colors duration-150 placeholder:text-placeholder focus:outline-none",
            error ? "border-expired" : focused ? "border-ink" : "border-black/15",
            className ?? "",
          ].join(" ")}
        />
      </div>
      {(error || hint) && (
        <p className={["mt-1 text-xs", error ? "text-expired" : "text-muted"].join(" ")}>
          {error || hint}
        </p>
      )}
    </div>
  )
}

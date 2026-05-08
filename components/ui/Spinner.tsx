interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = { sm: "size-4", md: "size-6", lg: "size-10" }

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <span
      className={[
        "block rounded-full border-2 border-current border-t-transparent animate-spin",
        sizeClasses[size],
        className,
      ].join(" ")}
      aria-label="Cargando"
    />
  )
}

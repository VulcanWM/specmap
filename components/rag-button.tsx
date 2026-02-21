"use client"

import { cn } from "@/lib/utils"

export type RagStatus = "red" | "amber" | "green" | null

interface RagButtonProps {
  status: RagStatus
  onChange: (status: RagStatus) => void
}

export function RagButton({ status, onChange }: RagButtonProps) {
  const options: { value: RagStatus; label: string; activeClass: string; inactiveClass: string }[] = [
    {
      value: "red",
      label: "R",
      activeClass: "bg-rag-red-active text-card shadow-sm",
      inactiveClass: "bg-rag-red text-muted-foreground hover:bg-rag-red-active/60",
    },
    {
      value: "amber",
      label: "A",
      activeClass: "bg-rag-amber-active text-card shadow-sm",
      inactiveClass: "bg-rag-amber text-muted-foreground hover:bg-rag-amber-active/60",
    },
    {
      value: "green",
      label: "G",
      activeClass: "bg-rag-green-active text-card shadow-sm",
      inactiveClass: "bg-rag-green text-muted-foreground hover:bg-rag-green-active/60",
    },
  ]

  return (
    <div className="flex gap-1 shrink-0">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(status === option.value ? null : option.value)}
          className={cn(
            "w-7 h-7 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer",
            status === option.value ? option.activeClass : option.inactiveClass
          )}
          aria-label={`Mark as ${option.value}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

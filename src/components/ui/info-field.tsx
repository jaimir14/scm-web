import type React from "react";

interface InfoFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function InfoField({ label, value, className = "col-span-6" }: InfoFieldProps) {
  return (
    <div className={className}>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="text-sm font-medium mt-0.5">{value}</div>
    </div>
  );
}

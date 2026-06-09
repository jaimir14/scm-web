import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Shared form layout primitives.
 *
 * Use these to keep all forms across the app visually consistent:
 *   - <PageHeader />        — page title block with icon avatar and eyebrow.
 *   - <FormSection />       — grouped card with icon, title and description.
 *   - <FormField />         — label + control + error message wrapper.
 *   - <FormGrid />          — 12-column responsive grid.
 *   - <StickyFormActions /> — sticky footer for primary form actions.
 */

type IconCmp = React.ComponentType<{ className?: string }>;

/* ─────────────────────────── Page Header ─────────────────────────── */

interface PageHeaderProps {
  icon?: IconCmp;
  /** Small uppercase label rendered above the title. */
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Optional content rendered on the right (buttons, badges, etc.). */
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("relative flex items-start gap-4 rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-[hsl(var(--primary-soft)/0.4)] p-5 md:p-6 shadow-[var(--shadow-soft)] overflow-hidden", className)}>
      <div className="pointer-events-none absolute -top-16 -right-12 h-40 w-40 rounded-full bg-[hsl(var(--primary-glow)/0.08)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-1/3 h-32 w-32 rounded-full bg-[hsl(var(--coral)/0.06)] blur-3xl" />
      {Icon && (
        <div className="relative h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] text-primary-foreground flex items-center justify-center shadow-[var(--shadow-glow)] shrink-0 ring-4 ring-[hsl(var(--primary)/0.08)]">
          <Icon className="h-5 w-5 md:h-6 md:w-6" />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[hsl(var(--coral))] ring-2 ring-card" />
        </div>
      )}
      <div className="relative min-w-0 flex-1">
        {eyebrow && (
          <p className="text-[10.5px] uppercase tracking-[0.14em] text-[hsl(var(--primary))] font-semibold mb-1">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight truncate">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1.5">{description}</p>
        )}
      </div>
      {actions && <div className="relative shrink-0 flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ─────────────────────────── Form Section ─────────────────────────── */

interface FormSectionProps {
  icon?: IconCmp;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Optional content rendered on the right side of the section header. */
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  icon: Icon,
  title,
  description,
  actions,
  children,
  className,
}: FormSectionProps) {
  return (
    <Card className={cn("overflow-hidden border-border/60 bg-card shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-shadow rounded-2xl", className)}>
      <div className="relative flex items-start gap-3 px-6 pt-5 pb-4 border-b border-border/50 bg-card">
        <span className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))]" />
        {Icon && (
          <div className="h-9 w-9 rounded-xl bg-[hsl(var(--primary-soft))] text-[hsl(var(--primary))] flex items-center justify-center shrink-0 ring-1 ring-[hsl(var(--primary)/0.12)]">
            <Icon className="h-[15px] w-[15px]" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold text-foreground leading-tight tracking-tight">{title}</h2>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
      </div>
      <CardContent className="pt-5">{children}</CardContent>
    </Card>
  );
}

/* ─────────────────────────── Form Field ─────────────────────────── */

interface FormFieldProps {
  label: React.ReactNode;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  hint?: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  children,
  required,
  error,
  hint,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/* ─────────────────────────── Form Grid ─────────────────────────── */

export function FormGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("grid grid-cols-12 gap-4", className)}>{children}</div>;
}

/* ─────────────────────────── Sticky Actions ─────────────────────────── */

interface StickyFormActionsProps {
  /** Optional helper text shown on the left (hidden on small screens). */
  hint?: React.ReactNode;
  children: React.ReactNode;
  /** Max width container (defaults to max-w-5xl to match form bodies). */
  maxWidthClassName?: string;
}

export function StickyFormActions({
  hint,
  children,
  maxWidthClassName = "max-w-5xl",
}: StickyFormActionsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div
        className={cn(
          "mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-3",
          maxWidthClassName,
        )}
      >
        {hint ? (
          <div className="hidden sm:block text-xs text-muted-foreground">{hint}</div>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2 ml-auto">{children}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Form Page Wrapper ─────────────────────────── */

/**
 * Standard padded wrapper for form pages. Adds bottom padding so the sticky
 * action bar never covers the last fields.
 */
export function FormPage({
  children,
  className,
  hasStickyActions = false,
  maxWidthClassName = "max-w-5xl",
}: {
  children: React.ReactNode;
  className?: string;
  hasStickyActions?: boolean;
  maxWidthClassName?: string;
}) {
  return (
    <div
      className={cn(
        "p-4 md:p-8",
        hasStickyActions && "pb-40 md:pb-36",
        className,
      )}
    >
      <div className={cn("mx-auto w-full space-y-6", maxWidthClassName)}>{children}</div>
    </div>
  );
}

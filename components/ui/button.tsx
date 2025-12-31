import { ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
  asChild?: boolean;
};

export function Button({ className, variant = "primary", asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  const base =
    "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b1021]";
  const variants = {
    primary: "bg-gradient-to-r from-indigo-500 to-sky-400 text-white hover:opacity-95 focus:ring-indigo-400",
    ghost: "bg-transparent text-slate-200 border border-white/10 hover:border-white/30 focus:ring-white/20"
  };

  return <Comp className={cn(base, variants[variant], className)} {...props} />;
}

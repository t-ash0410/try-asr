import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '~/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] relative group overflow-hidden rounded-2xl backdrop-blur-[2px] cursor-default hover:cursor-pointer",
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-[#006b40]/20 to-[#009960]/10 text-[#006b40] hover:text-[#00cc7d] border-2 border-[#009960]/50 hover:border-[#00ff9d]/50 shadow-[inset_0_0_15px_rgba(0,153,96,0.15),0_0_15px_rgba(0,153,96,0.1)] hover:shadow-[inset_0_0_15px_rgba(0,255,157,0.2),0_0_15px_rgba(0,255,157,0.15)] before:absolute before:inset-[1px] before:bg-[linear-gradient(90deg,transparent_0%,rgba(0,107,64,0.1)_45%,rgba(0,107,64,0.1)_55%,transparent_100%)] before:opacity-0 hover:before:opacity-100 hover:before:bg-[linear-gradient(90deg,transparent_0%,rgba(0,255,157,0.15)_45%,rgba(0,255,157,0.15)_55%,transparent_100%)] before:transition-all after:absolute after:inset-0 after:[background:linear-gradient(0deg,transparent_46%,rgba(0,107,64,0.2)_47%,rgba(0,107,64,0.2)_53%,transparent_54%)_right_-100%_top_0/200%_100%_no-repeat] hover:after:[background:linear-gradient(0deg,transparent_46%,rgba(0,255,157,0.25)_47%,rgba(0,255,157,0.25)_53%,transparent_54%)_right_-100%_top_0/200%_100%_no-repeat] hover:after:animate-[scan_2s_ease-in-out_infinite] before:rounded-2xl after:rounded-2xl transition-colors duration-300',
        destructive:
          'bg-gradient-to-r from-red-600/20 to-red-500/10 text-white hover:text-white/90 border-2 border-white/50 hover:border-white/60 shadow-[inset_0_0_15px_rgba(255,255,255,0.15),0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[inset_0_0_15px_rgba(255,255,255,0.2),0_0_15px_rgba(255,255,255,0.15)] before:absolute before:inset-[1px] before:bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_45%,rgba(255,255,255,0.1)_55%,transparent_100%)] before:opacity-0 hover:before:opacity-100 hover:before:bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.15)_45%,rgba(255,255,255,0.15)_55%,transparent_100%)] before:transition-all after:absolute after:inset-0 after:[background:linear-gradient(0deg,transparent_46%,rgba(255,255,255,0.2)_47%,rgba(255,255,255,0.2)_53%,transparent_54%)_right_-100%_top_0/200%_100%_no-repeat] hover:after:[background:linear-gradient(0deg,transparent_46%,rgba(255,255,255,0.25)_47%,rgba(255,255,255,0.25)_53%,transparent_54%)_right_-100%_top_0/200%_100%_no-repeat] hover:after:animate-[scan_2s_ease-in-out_infinite] before:rounded-2xl after:rounded-2xl transition-colors duration-300',
        outline:
          'bg-transparent text-foreground border-2 border-border/50 shadow-[inset_0_0_15px_rgba(255,255,255,0.1),0_0_15px_rgba(255,255,255,0.05)] before:absolute before:inset-[1px] before:bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_45%,rgba(255,255,255,0.1)_55%,transparent_100%)] before:opacity-0 hover:before:opacity-100 before:transition-opacity after:absolute after:inset-0 after:[background:linear-gradient(0deg,transparent_46%,rgba(255,255,255,0.2)_47%,rgba(255,255,255,0.2)_53%,transparent_54%)_right_-100%_top_0/200%_100%_no-repeat] hover:after:animate-[scan_2s_ease-in-out_infinite] before:rounded-2xl after:rounded-2xl',
        secondary:
          'bg-gradient-to-r from-violet-400/10 to-violet-500/5 text-white/80 hover:text-white border-2 border-white/50 hover:border-white/60 shadow-[inset_0_0_15px_rgba(255,255,255,0.15),0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[inset_0_0_15px_rgba(255,255,255,0.2),0_0_15px_rgba(255,255,255,0.15)] before:absolute before:inset-[1px] before:bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_45%,rgba(255,255,255,0.1)_55%,transparent_100%)] before:opacity-0 hover:before:opacity-100 hover:before:bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.15)_45%,rgba(255,255,255,0.15)_55%,transparent_100%)] before:transition-all after:absolute after:inset-0 after:[background:linear-gradient(0deg,transparent_46%,rgba(255,255,255,0.2)_47%,rgba(255,255,255,0.2)_53%,transparent_54%)_right_-100%_top_0/200%_100%_no-repeat] hover:after:[background:linear-gradient(0deg,transparent_46%,rgba(255,255,255,0.25)_47%,rgba(255,255,255,0.25)_53%,transparent_54%)_right_-100%_top_0/200%_100%_no-repeat] hover:after:animate-[scan_2s_ease-in-out_infinite] before:rounded-2xl after:rounded-2xl transition-colors duration-300',
        ghost:
          'hover:bg-accent/10 hover:text-accent-foreground before:absolute before:inset-[1px] before:bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_45%,rgba(255,255,255,0.1)_55%,transparent_100%)] before:opacity-0 hover:before:opacity-100 before:transition-opacity before:rounded-2xl',
        link: 'text-primary hover:text-primary/80 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-6 py-2',
        sm: 'h-9 px-5 py-1.5',
        lg: 'h-11 px-8 py-2.5',
        icon: 'size-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }


"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"

interface SidebarContextProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  isCollapsible: boolean
  variant: "sidebar" | "drawer"
  side: "left" | "right"
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(undefined)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
  collapsible?: boolean | "icon"
  variant?: "sidebar" | "drawer"
  side?: "left" | "right"
}

function SidebarProvider({
  children,
  defaultOpen = true,
  collapsible = true,
  variant = "sidebar",
  side = "left",
}: SidebarProviderProps) {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = React.useState(isMobile ? false : defaultOpen)
  const isCollapsible = collapsible !== false

  React.useEffect(() => {
    if (isMobile) {
      setIsOpen(false)
    } else {
      setIsOpen(defaultOpen)
    }
  }, [isMobile, defaultOpen])

  return (
    <SidebarContext.Provider
      value={{ isOpen, setIsOpen, isCollapsible, variant, side }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

const sidebarVariants = cva(
  "fixed inset-y-0 z-50 flex h-full flex-col border-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out data-[variant=drawer]:border-none",
  {
    variants: {
      side: {
        left: "border-r",
        right: "border-l",
      },
      isOpen: {
        true: "",
        false: "",
      },
      isCollapsible: {
        true: "",
        false: "",
      },
      variant: {
        sidebar: "",
        drawer: "shadow-lg",
      }
    },
    compoundVariants: [
      {
        side: "left",
        isOpen: true,
        variant: "sidebar",
        className: "w-72",
      },
      {
        side: "left",
        isOpen: false,
        isCollapsible: true,
        variant: "sidebar",
        className: "w-[4.5rem]",
      },
      {
        side: "right",
        isOpen: true,
        variant: "sidebar",
        className: "w-72",
      },
      {
        side: "right",
        isOpen: false,
        isCollapsible: true,
        variant: "sidebar",
        className: "w-[4.5rem]",
      },
      {
        side: "left",
        isOpen: true,
        variant: "drawer",
        className: "w-72 translate-x-0",
      },
      {
        side: "left",
        isOpen: false,
        variant: "drawer",
        className: "w-72 -translate-x-full",
      },
      {
        side: "right",
        isOpen: true,
        variant: "drawer",
        className: "w-72 translate-x-0",
      },
      {
        side: "right",
        isOpen: false,
        variant: "drawer",
        className: "w-72 translate-x-full",
      },
    ],
  }
)

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children, // remove variant props from being forwarded to DOM
     ...props
  }, ref) => {
    const { isOpen, isCollapsible, variant, side } = useSidebar()

    // Remove potential variant props from being spread to the DOM
    // (they're meant for styling only and cause React warnings if forwarded)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isOpen: _io, isCollapsible: _ic, variant: _v, side: _s, ...rest } = props as any;

    return (
      <div
        ref={ref}
        className={cn(
          sidebarVariants({ isOpen, isCollapsible, variant, side }),
          className
        )}
        data-collapsible={isCollapsible ? (isOpen ? "expanded" : "icon") : "disabled"}
        data-variant={variant}
        {...(rest as React.HTMLAttributes<HTMLDivElement>)}
      >
        {children}
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isOpen, isCollapsible } = useSidebar()
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center border-b border-sidebar-border p-4",
        !isOpen && isCollapsible && "justify-center px-0",
        className
      )}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isOpen, isCollapsible } = useSidebar()
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center border-t border-sidebar-border p-4",
        !isOpen && isCollapsible && "justify-center px-0",
        className
      )}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"


const sidebarInsetVariants = cva("transition-all duration-300 ease-in-out", {
  variants: {
    side: {
      left: "",
      right: "",
    },
    isOpen: {
      true: "",
      false: "",
    },
    isCollapsible: {
      true: "",
      false: "",
    },
    isMobile: {
      true: "ml-0",
      false: "",
    }
  },
  compoundVariants: [
    {
      side: "left",
      isOpen: true,
      isCollapsible: true,
      isMobile: false,
      className: "ml-72",
    },
    {
      side: "left",
      isOpen: false,
      isCollapsible: true,
      isMobile: false,
      className: "ml-[4.5rem]",
    },
    {
      side: "left",
      isOpen: true,
      isCollapsible: false,
      isMobile: false,
      className: "ml-72",
    },
    {
      side: "right",
      isOpen: true,
      isCollapsible: true,
      isMobile: false,
      className: "mr-72",
    },
    {
      side: "right",
      isOpen: false,
      isCollapsible: true,
      isMobile: false,
      className: "mr-[4.5rem]",
    },
    {
      side: "right",
      isOpen: true,
      isCollapsible: false,
      isMobile: false,
      className: "mr-72",
    },
  ],
})


const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof sidebarInsetVariants>
>(({ className, children, ...props }, ref) => {
  const { isOpen, isCollapsible, side, variant } = useSidebar()
  const isMobile = useIsMobile()

  if (variant === "drawer") {
    return (
      <div ref={ref} className={cn("min-h-screen", className)} {...props}>
        {children}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={cn(sidebarInsetVariants({isOpen, isCollapsible, side, isMobile}), "min-h-screen", className)}
      {...props}
    >
      {children}
    </div>
  )
})
SidebarInset.displayName = "SidebarInset"


const SidebarRail = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { isOpen, isCollapsible, variant } = useSidebar()
  const Comp = children ? "div" : Slot
  if (variant === 'drawer') return null;

  return (
    <Comp
      ref={ref}
      className={cn(
        "absolute bottom-0 top-0 z-20 flex flex-col justify-end",
        isOpen && isCollapsible ? "pointer-events-none opacity-0" : "opacity-100",
        className
      )}
      {...props}
    >
      {children ?? (
        <SidebarTrigger className="my-4 flex items-center justify-center" />
      )}
    </Comp>
  )
})
SidebarRail.displayName = "SidebarRail"

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    icon?: React.ReactNode
  }
>(({ className, icon, children, ...props }, ref) => {
  const { isOpen, setIsOpen, isCollapsible, variant, side } = useSidebar()
  const isMobile = useIsMobile()

  const defaultIcon =
    side === "left" ? (
      isOpen ? (
        <ChevronLeft />
      ) : (
        <ChevronRight />
      )
    ) : isOpen ? (
      <ChevronRight />
    ) : (
      <ChevronLeft />
    )

  if (variant === "drawer" && !isMobile) return null;

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(
        "rounded-full data-[collapsible=false]:hidden",
        isCollapsible && variant === "sidebar" && "absolute -right-4 top-1/2 -translate-y-1/2 border bg-background hover:bg-muted",
        side === "right" && isCollapsible && variant === "sidebar" && "-left-4",
        className
      )}
      data-collapsible={isCollapsible}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {icon || children || defaultIcon}
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isOpen, setIsOpen, variant } = useSidebar()
  const isMobile = useIsMobile()

  if (variant === "sidebar") return null;

  return (
    <div
      ref={ref}
      className={cn(
        "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ease-in-out",
        isOpen && (isMobile || variant === "drawer")
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
        className
      )}
      onClick={() => setIsOpen(false)}
      {...props}
    />
  )
})
SidebarOverlay.displayName = "SidebarOverlay"


export {
  SidebarProvider,
  useSidebar,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarRail,
  SidebarTrigger,
  SidebarOverlay,
}

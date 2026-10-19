import * as React from "react"
import { cn } from "@/shared/lib/utils"
import { buttonVariants } from "@/shared/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-wrap items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
  size?: "default" | "sm" | "lg" | "icon"
  as?: "button" | "a"
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>

function PaginationLink({
  className,
  isActive,
  size = "icon",
  as = "button",
  ...props
}: PaginationLinkProps) {
  const commonClasses = cn(
    buttonVariants({
      variant: isActive ? "outline" : "ghost",
      size,
    }),
    isActive && "border-primary bg-primary/10 text-primary font-semibold",
    className
  )

  if (as === "a") {
    return (
      <a
        aria-current={isActive ? "page" : undefined}
        data-slot="pagination-link"
        data-active={isActive}
        className={commonClasses}
        {...(props as React.ComponentPropsWithoutRef<"a">)}
      />
    )
  }

  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={commonClasses}
      {...(props as React.ComponentPropsWithoutRef<"button">)}
    />
  )
}

function PaginationPrevious({
  className,
  text = "Назад",
  ...props
}: PaginationLinkProps & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Перейти на предыдущую страницу"
      size="default"
      className={cn("gap-1 pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon className="size-4" />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  text = "Вперед",
  ...props
}: PaginationLinkProps & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Перейти на следующую страницу"
      size="default"
      className={cn("gap-1 pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">{text}</span>
      <ChevronRightIcon className="size-4" />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-9 items-center justify-center text-muted-foreground",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">Другие страницы</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}

import * as React from "react"
import { cn } from "@/lib/utils"

export const DropdownMenu = ({ children }: any) => <div>{children}</div>
export const DropdownMenuTrigger = ({ children, asChild }: any) => <div>{children}</div>
export const DropdownMenuContent = ({ children, align, className }: any) => <div className={className}>{children}</div>
export const DropdownMenuItem = ({ children, onClick, className }: any) => <div onClick={onClick} className={className}>{children}</div>
export const DropdownMenuLabel = ({ children, className }: any) => <div className={className}>{children}</div>
export const DropdownMenuSeparator = ({ className }: any) => <div className={className} />
export const DropdownMenuGroup = ({ children }: any) => <div>{children}</div>
export const DropdownMenuShortcut = ({ children }: any) => <span>{children}</span>

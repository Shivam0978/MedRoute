import * as React from "react";
import { cn } from "@/lib/utils";

export const DropdownMenu = ({ children }) => <div>{children}</div>;
export const DropdownMenuTrigger = ({ children, asChild }) => <div>{children}</div>;
export const DropdownMenuContent = ({ children, align, className }) => <div className={className}>{children}</div>;
export const DropdownMenuItem = ({ children, onClick, className }) => <div onClick={onClick} className={className}>{children}</div>;
export const DropdownMenuLabel = ({ children, className }) => <div className={className}>{children}</div>;
export const DropdownMenuSeparator = ({ className }) => <div className={className} />;
export const DropdownMenuGroup = ({ children }) => <div>{children}</div>;
export const DropdownMenuShortcut = ({ children }) => <span>{children}</span>;
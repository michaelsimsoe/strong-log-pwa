// Type declarations for UI components
declare module '@/components/ui/dialog' {
  import * as React from 'react';

  export interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
  }

  export const Dialog: React.FC<DialogProps>;

  export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
  }

  export const DialogContent: React.FC<DialogContentProps>;

  export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
  }

  export const DialogHeader: React.FC<DialogHeaderProps>;

  export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children?: React.ReactNode;
  }

  export const DialogTitle: React.FC<DialogTitleProps>;

  export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children?: React.ReactNode;
  }

  export const DialogDescription: React.FC<DialogDescriptionProps>;
}

declare module '@/components/ui/sheet' {
  import * as React from 'react';

  export interface SheetProps {
    children?: React.ReactNode;
  }

  export const Sheet: React.FC<SheetProps>;

  export interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
    asChild?: boolean;
  }

  export const SheetTrigger: React.FC<SheetTriggerProps>;

  export interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
  }

  export const SheetContent: React.FC<SheetContentProps>;

  export interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
  }

  export const SheetHeader: React.FC<SheetHeaderProps>;

  export interface SheetTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children?: React.ReactNode;
  }

  export const SheetTitle: React.FC<SheetTitleProps>;

  export interface SheetDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children?: React.ReactNode;
  }

  export const SheetDescription: React.FC<SheetDescriptionProps>;

  export interface SheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
  }

  export const SheetFooter: React.FC<SheetFooterProps>;

  export interface SheetCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
    asChild?: boolean;
  }

  export const SheetClose: React.FC<SheetCloseProps>;
}

declare module '@/components/ui/checkbox' {
  import * as React from 'react';

  export interface CheckboxProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
  }

  export const Checkbox: React.FC<CheckboxProps>;
}

declare module '@/components/ui/separator' {
  import * as React from 'react';

  export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: 'horizontal' | 'vertical';
    decorative?: boolean;
  }

  export const Separator: React.FC<SeparatorProps>;
}

declare module '@/components/ui/button' {
  import * as React from 'react';

  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg';
    asChild?: boolean;
  }

  export const Button: React.FC<ButtonProps>;
}

declare module '@/components/ui/badge' {
  import * as React from 'react';

  export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    asChild?: boolean;
  }

  export const Badge: React.FC<BadgeProps>;
}

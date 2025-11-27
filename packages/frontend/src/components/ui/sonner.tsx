'use client'

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'

import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': '#ffffff',
          '--normal-text': '#000000',
          '--normal-border': '#e5e5e5',
          '--border-radius': '8px',
          '--success-bg': '#ffffff',
          '--success-border': '#22c55e',
          '--success-text': '#000000',
          '--error-bg': '#ffffff',
          '--error-border': '#ef4444',
          '--error-text': '#000000',
          '--warning-bg': '#ffffff',
          '--warning-border': '#f59e0b',
          '--warning-text': '#000000',
          '--info-bg': '#ffffff',
          '--info-border': '#3b82f6',
          '--info-text': '#000000',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

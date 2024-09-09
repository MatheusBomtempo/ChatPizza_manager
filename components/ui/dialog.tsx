// components/ui/dialog.tsx
import React from 'react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg relative">
        {children}
        <button
          className="absolute top-2 right-2 text-gray-500"
          onClick={() => onOpenChange(false)}
        >
          X
        </button>
      </div>
    </div>
  )
}

interface DialogContentProps {
  children: React.ReactNode
}

export const DialogContent = ({ children }: DialogContentProps) => {
  return <div>{children}</div>
}

export const DialogTitle = ({ children }: { children: React.ReactNode }) => {
  return <h2 className="text-lg font-semibold">{children}</h2>
}

export const DialogOverlay = ({ onClick }: { onClick: () => void }) => {
  return <div className="fixed inset-0 bg-black opacity-50" onClick={onClick}></div>
}

'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { ReactNode } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  title: string
  description: string
  onConfirm: () => void
  onCancel?: () => void
  trigger: ReactNode
  destructive?: boolean
  confirmLabel?: string
  cancelLabel?: string
}

export default function ConfirmDialog({
  title,
  description,
  onConfirm,
  onCancel,
  trigger,
  destructive = true,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
}: ConfirmDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-start gap-4 mb-5">
            <div className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${destructive ? 'bg-red-50' : 'bg-amber-50'}`}>
              <AlertTriangle size={20} className={destructive ? 'text-red-500' : 'text-amber-500'} />
            </div>
            <div className="flex-1 pr-4">
              <Dialog.Title className="text-base font-semibold text-gray-900 mb-1">{title}</Dialog.Title>
              <Dialog.Description className="text-sm text-gray-500 leading-relaxed">{description}</Dialog.Description>
            </div>
            <Dialog.Close className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X size={16} />
            </Dialog.Close>
          </div>

          <div className="flex gap-3 justify-end">
            <Dialog.Close asChild>
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {cancelLabel}
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors ${
                  destructive
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {confirmLabel}
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

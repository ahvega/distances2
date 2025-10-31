'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import React from 'react';

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function Dialog({ open, onOpenChange, title, description, children, footer }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <RadixDialog.Content className="fixed left-1/2 top-1/2 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-xl focus:outline-none">
          {(title || description) && (
            <div className="mb-4">
              {title && (
                <RadixDialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</RadixDialog.Title>
              )}
              {description && (
                <RadixDialog.Description className="mt-1 text-sm text-gray-600 dark:text-gray-300">{description}</RadixDialog.Description>
              )}
            </div>
          )}
          <div className="space-y-4">{children}</div>
          {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}


// frontend/components/ui/Textarea.tsx
import { TextareaHTMLAttributes } from 'react';
import { classNames } from '../../utils/classNames';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const Textarea = ({ className, ...props }: TextareaProps) => (
  <textarea
    className={classNames(
      'w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out',
      className,
    )}
    {...props}
  />
);

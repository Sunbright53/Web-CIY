// src/components/ui/Input.tsx
import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  /** class ของ div ครอบ (แบ็คคอมแพท: ถ้าใส่ className จะใช้เป็น wrapperClassName) */
  wrapperClassName?: string;
  /** class ของ input ด้านใน */
  inputClassName?: string;
};

export function Input({
  label,
  wrapperClassName = '',
  inputClassName = '',
  className,            // ไว้รับของเดิมที่ใช้กับ wrapper
  ...props              // รับทุก native prop เช่น autoComplete, type, name, onChange ฯลฯ
}: InputProps) {
  const wrapperCls = wrapperClassName || className || '';

  return (
    <div className={wrapperCls}>
      {label && (
        <label className="block text-sm mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        {...props}
        className={`input w-full px-4 py-3 rounded-xl ${inputClassName}`}
      />
    </div>
  );
}

// --- (ออปชัน) ทำ Textarea ให้รองรับทุก prop ด้วยเช่นกัน ---
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  wrapperClassName?: string;
  textareaClassName?: string;
};

export function Textarea({
  label,
  wrapperClassName = '',
  textareaClassName = '',
  className,
  rows = 3,
  ...props
}: TextareaProps) {
  const wrapperCls = wrapperClassName || className || '';
  return (
    <div className={wrapperCls}>
      {label && (
        <label className="block text-sm mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        {...props}
        className={`input w-full px-4 py-3 rounded-xl min-h-[80px] resize-y ${textareaClassName}`}
      />
    </div>
  );
}
import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  helper?: string;
  required?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  id,
  error,
  helper,
  required,
  className = '',
  onKeyDown,
  ...rest
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentInput = e.currentTarget;
      const container = currentInput.closest('main') || currentInput.closest('form') || document.body;
      const focusableSelectors = [
        'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([disabled]):not([readonly])',
        'textarea:not([disabled]):not([readonly])',
        'select:not([disabled])',
      ].join(', ');

      const elements = (Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[]).filter((el) => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
      });

      const currentIndex = elements.indexOf(currentInput);
      if (currentIndex >= 0 && currentIndex < elements.length - 1) {
        elements[currentIndex + 1].focus();
      }
    }

    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      <label
        htmlFor={id}
        className="text-sm font-semibold text-slate-800 flex items-center justify-between"
      >
        <span>
          {label}
          {required && <span className="text-blue-600 ml-1" title="Campo obrigatório">*</span>}
        </span>
      </label>
      <input
        id={id}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
        onKeyDown={handleKeyDown}
        className={`w-full min-h-[48px] px-4 py-3 rounded-xl border bg-white text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all ${
          error ? 'border-red-500 bg-red-50/20' : 'border-slate-200/90 hover:border-slate-300'
        } ${className}`}
        {...rest}
      />
      {error ? (
        <span id={`${id}-error`} className="text-xs font-medium text-red-600 animate-fadeIn">
          {error}
        </span>
      ) : helper ? (
        <span id={`${id}-helper`} className="text-xs text-slate-500">
          {helper}
        </span>
      ) : null}
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  error?: string;
  helper?: string;
  required?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  id,
  error,
  helper,
  required,
  rows = 4,
  className = '',
  ...rest
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      <label
        htmlFor={id}
        className="text-sm font-semibold text-slate-800 flex items-center justify-between"
      >
        <span>
          {label}
          {required && <span className="text-blue-600 ml-1" title="Campo obrigatório">*</span>}
        </span>
      </label>
      <textarea
        id={id}
        rows={rows}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
        className={`w-full px-4 py-3 rounded-xl border bg-white text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all resize-y min-h-[100px] ${
          error ? 'border-red-500 bg-red-50/20' : 'border-slate-200/90 hover:border-slate-300'
        } ${className}`}
        {...rest}
      />
      {error ? (
        <span id={`${id}-error`} className="text-xs font-medium text-red-600">
          {error}
        </span>
      ) : helper ? (
        <span id={`${id}-helper`} className="text-xs text-slate-500">
          {helper}
        </span>
      ) : null}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: string[] | { value: string; label: string }[];
  error?: string;
  helper?: string;
  required?: boolean;
  placeholderOption?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  id,
  options,
  error,
  helper,
  required,
  placeholderOption = 'Selecione uma opção...',
  className = '',
  ...rest
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      <label
        htmlFor={id}
        className="text-sm font-semibold text-slate-800 flex items-center justify-between"
      >
        <span>
          {label}
          {required && <span className="text-blue-600 ml-1" title="Campo obrigatório">*</span>}
        </span>
      </label>
      <div className="relative">
        <select
          id={id}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
          className={`w-full min-h-[48px] px-4 py-3 pr-10 rounded-xl border bg-white text-slate-900 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all cursor-pointer ${
            error ? 'border-red-500 bg-red-50/20' : 'border-slate-200/90 hover:border-slate-300'
          } ${className}`}
          {...rest}
        >
          {placeholderOption && (
            <option value="" disabled>
              {placeholderOption}
            </option>
          )}
          {options.map((opt) => {
            const val = typeof opt === 'string' ? opt : opt.value;
            const lab = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={val} value={val}>
                {lab}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error ? (
        <span id={`${id}-error`} className="text-xs font-medium text-red-600">
          {error}
        </span>
      ) : helper ? (
        <span id={`${id}-helper`} className="text-xs text-slate-500">
          {helper}
        </span>
      ) : null}
    </div>
  );
};

interface RadioGroupProps {
  label: string;
  name: string;
  options: string[] | { value: string; label: string; desc?: string }[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  horizontal?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  required,
  error,
  horizontal = false,
}) => {
  return (
    <div className="w-full flex flex-col gap-2 text-left">
      <span className="text-sm font-semibold text-slate-800">
        {label}
        {required && <span className="text-blue-600 ml-1">*</span>}
      </span>
      <div className={`grid gap-2.5 ${horizontal ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'}`}>
        {options.map((opt) => {
          const optVal = typeof opt === 'string' ? opt : opt.value;
          const optLab = typeof opt === 'string' ? opt : opt.label;
          const isSelected = value === optVal;
          return (
            <label
              key={optVal}
              className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs'
                  : 'border-slate-200/90 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={optVal}
                checked={isSelected}
                onChange={() => onChange(optVal)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 border-slate-300"
              />
              <span className="text-sm font-medium">{optLab}</span>
            </label>
          );
        })}
      </div>
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </div>
  );
};

interface CheckboxGroupProps {
  label: string;
  options: string[] | { value: string; label: string }[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  helper?: string;
  columns?: 1 | 2 | 3;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  helper,
  columns = 2,
}) => {
  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const gridCols =
    columns === 3
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
      : columns === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : 'grid-cols-1';

  return (
    <div className="w-full flex flex-col gap-2 text-left">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      {helper && <span className="text-xs text-slate-500 -mt-1">{helper}</span>}
      <div className={`grid gap-2 ${gridCols}`}>
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lab = typeof opt === 'string' ? opt : opt.label;
          const checked = selectedValues.includes(val);

          return (
            <label
              key={val}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                checked
                  ? 'border-blue-600 bg-blue-50/40 text-blue-950 font-medium'
                  : 'border-slate-200/90 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleOption(val)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-sm">{lab}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

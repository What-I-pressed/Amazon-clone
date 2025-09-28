import React from "react";

interface TextareaProps {
  placeholder?: string; // Placeholder text
  rows?: number; // Number of rows
  value?: string; // Current value
  onChange?: (value: string) => void; // Change handler
  className?: string; // Additional CSS classes
  disabled?: boolean; // Disabled state
  error?: boolean; // Error state
  hint?: string; // Hint text to display
}

const TextArea: React.FC<TextareaProps> = ({
  placeholder = "Enter your message", // Default placeholder
  rows = 3, // Default number of rows
  value = "", // Default value
  onChange, // Callback for changes
  className = "", // Additional custom styles
  disabled = false, // Disabled state
  error = false, // Error state
  hint = "", // Default hint text
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  let textareaClasses = `w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden ${className} `;

  if (disabled) {
    textareaClasses += ` bg-gray-100 opacity-50 text-[#838383] border-[#dadada] cursor-not-allowed opacity40 dark:bg-[#2a2a2a] dark:text-[#989898] dark:border-[#454545]`;
  } else if (error) {
    textareaClasses += ` bg-transparent  border-[#dadada] focus:border-error-300 focus:ring-3 focus:ring-error-500/10 dark:border-[#454545] dark:bg-[#151515] dark:text-white/90 dark:focus:border-error-800`;
  } else {
    textareaClasses += ` bg-transparent text-[#151515] dark:text-[#dadada] text-[#151515] border-[#dadada] focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-[#454545] dark:bg-[#151515] dark:text-white/90 dark:focus:border-brand-800`;
  }

  return (
    <div className="relative">
      <textarea
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={textareaClasses}
      />
      {hint && (
        <p
          className={`mt-2 text-sm ${
            error ? "text-error-500" : "text-[#838383] dark:text-[#989898]"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default TextArea;

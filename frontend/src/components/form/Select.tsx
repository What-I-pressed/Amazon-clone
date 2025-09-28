import { useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
}) => {
  // Manage the selected value
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedValue(value);
    onChange(value); // Trigger parent handler
  };

  return (
    <select
      className={`h-11 w-full appearance-none rounded-lg border border-[#dadada] bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-[#989898] focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-[#454545] dark:bg-[#151515] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
        selectedValue
          ? "text-[#2a2a2a] dark:text-white/90"
          : "text-[#989898] dark:text-[#989898]"
      } ${className}`}
      value={selectedValue}
      onChange={handleChange}
    >
      {/* Placeholder option */}
      <option
        value=""
        disabled
        className="text-[#454545] dark:bg-[#151515] dark:text-[#989898]"
      >
        {placeholder}
      </option>
      {/* Map over options */}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="text-[#454545] dark:bg-[#151515] dark:text-[#989898]"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;

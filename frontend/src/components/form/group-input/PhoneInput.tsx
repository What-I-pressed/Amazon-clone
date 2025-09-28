import { useState } from "react";

interface CountryCode {
  code: string;
  label: string;
}

interface PhoneInputProps {
  countries: CountryCode[];
  placeholder?: string;
  onChange?: (phoneNumber: string) => void;
  selectPosition?: "start" | "end"; // New prop for dropdown position
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  countries,
  placeholder = "+1 (555) 000-0000",
  onChange,
  selectPosition = "start", // Default position is 'start'
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>("US");
  const [phoneNumber, setPhoneNumber] = useState<string>("+1");

  const countryCodes: Record<string, string> = countries.reduce(
    (acc, { code, label }) => ({ ...acc, [code]: label }),
    {}
  );

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    setPhoneNumber(countryCodes[newCountry]);
    if (onChange) {
      onChange(countryCodes[newCountry]);
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhoneNumber = e.target.value;
    setPhoneNumber(newPhoneNumber);
    if (onChange) {
      onChange(newPhoneNumber);
    }
  };

  return (
    <div className="relative flex">
      {/* Dropdown position: Start */}
      {selectPosition === "start" && (
        <div className="absolute">
          <select
            value={selectedCountry}
            onChange={handleCountryChange}
            className="appearance-none bg-none rounded-l-lg border-0 border-r border-[#e7e7e7] bg-transparent py-3 pl-3.5 pr-8 leading-tight text-[#454545] focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-[#2a2a2a] dark:text-[#989898]"
          >
            {countries.map((country) => (
              <option
                key={country.code}
                value={country.code}
                className="text-[#454545] dark:bg-[#151515] dark:text-[#989898]"
              >
                {country.code}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 flex items-center text-[#454545] pointer-events-none bg-none right-3 dark:text-[#989898]">
            <svg
              className="stroke-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Input field */}
      <input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        placeholder={placeholder}
        className={`dark:bg-dark-900 h-11 w-full ${
          selectPosition === "start" ? "pl-[84px]" : "pr-[84px]"
        } rounded-lg border border-[#dadada] bg-transparent py-3 px-4 text-sm text-[#2a2a2a] shadow-theme-xs placeholder:text-[#989898] focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-[#454545] dark:bg-[#151515] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
      />

      {/* Dropdown position: End */}
      {selectPosition === "end" && (
        <div className="absolute right-0">
          <select
            value={selectedCountry}
            onChange={handleCountryChange}
            className="appearance-none bg-none rounded-r-lg border-0 border-l border-[#e7e7e7] bg-transparent py-3 pl-3.5 pr-8 leading-tight text-[#454545] focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-[#2a2a2a] dark:text-[#989898]"
          >
            {countries.map((country) => (
              <option
                key={country.code}
                value={country.code}
                className="text-[#454545] dark:bg-[#151515] dark:text-[#989898]"
              >
                {country.code}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 flex items-center text-[#454545] pointer-events-none right-3 dark:text-[#989898]">
            <svg
              className="stroke-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneInput;

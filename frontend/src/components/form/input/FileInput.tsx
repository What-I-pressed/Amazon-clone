import { FC } from "react";

interface FileInputProps {
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileInput: FC<FileInputProps> = ({ className, onChange }) => {
  return (
    <input
      type="file"
      className={`focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-[#dadada] bg-transparent text-sm text-[#838383] shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-[#e7e7e7] file:bg-white file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-[#454545] placeholder:text-[#989898] hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-[#454545] dark:bg-[#151515] dark:text-[#989898] dark:text-white/90 dark:file:border-[#2a2a2a] dark:file:bg-white/[0.03] dark:file:text-[#989898] dark:placeholder:text-[#989898] ${className}`}
      onChange={onChange}
    />
  );
};

export default FileInput;

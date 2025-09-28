import { useState } from "react";

const ChartTab: React.FC = () => {
  const [selected, setSelected] = useState<
    "optionOne" | "optionTwo" | "optionThree"
  >("optionOne");

  const getButtonClass = (option: "optionOne" | "optionTwo" | "optionThree") =>
    selected === option
      ? "shadow-theme-xs text-[#151515] dark:text-white bg-white dark:bg-[#2a2a2a]"
      : "text-[#838383] dark:text-[#989898]";

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-[#151515]">
      <button
        onClick={() => setSelected("optionOne")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-[#151515]   dark:hover:text-white ${getButtonClass(
          "optionOne"
        )}`}
      >
        Monthly
      </button>

      <button
        onClick={() => setSelected("optionTwo")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-[#151515]   dark:hover:text-white ${getButtonClass(
          "optionTwo"
        )}`}
      >
        Quarterly
      </button>

      <button
        onClick={() => setSelected("optionThree")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-[#151515]   dark:hover:text-white ${getButtonClass(
          "optionThree"
        )}`}
      >
        Annually
      </button>
    </div>
  );
};

export default ChartTab;

import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import CountryMap from "./CountryMap";

export default function DemographicCard() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }
  return (
    <div className="rounded-2xl border border-[#e7e7e7] bg-white p-5 dark:border-[#2a2a2a] dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#2a2a2a] dark:text-white/90">
            Customers Demographic
          </h3>
          <p className="mt-1 text-[#838383] text-theme-sm dark:text-[#989898]">
            Number of customer based on country
          </p>
        </div>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-[#989898] hover:text-[#454545] dark:hover:text-[#dadada] size-6" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-[#838383] rounded-lg hover:bg-gray-100 hover:text-[#454545] dark:text-[#989898] dark:hover:bg-white/5 dark:hover:text-[#dadada]"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-[#838383] rounded-lg hover:bg-gray-100 hover:text-[#454545] dark:text-[#989898] dark:hover:bg-white/5 dark:hover:text-[#dadada]"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
      <div className="px-4 py-6 my-6 overflow-hidden border border-gary-200 rounded-2xl dark:border-[#2a2a2a] sm:px-6">
        <div
          id="mapOne"
          className="mapOne map-btn -mx-4 -my-6 h-[212px] w-[252px] 2xsm:w-[307px] xsm:w-[358px] sm:-mx-6 md:w-[668px] lg:w-[634px] xl:w-[393px] 2xl:w-[554px]"
        >
          <CountryMap />
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="items-center w-full rounded-full max-w-8">
              <img src="./images/country/country-01.svg" alt="usa" />
            </div>
            <div>
              <p className="font-semibold text-[#2a2a2a] text-theme-sm dark:text-white/90">
                USA
              </p>
              <span className="block text-[#838383] text-theme-xs dark:text-[#989898]">
                2,379 Customers
              </span>
            </div>
          </div>

          <div className="flex w-full max-w-[140px] items-center gap-3">
            <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-[#e7e7e7] dark:bg-[#2a2a2a]">
              <div className="absolute left-0 top-0 flex h-full w-[79%] items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"></div>
            </div>
            <p className="font-medium text-[#2a2a2a] text-theme-sm dark:text-white/90">
              79%
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="items-center w-full rounded-full max-w-8">
              <img src="./images/country/country-02.svg" alt="france" />
            </div>
            <div>
              <p className="font-semibold text-[#2a2a2a] text-theme-sm dark:text-white/90">
                France
              </p>
              <span className="block text-[#838383] text-theme-xs dark:text-[#989898]">
                589 Customers
              </span>
            </div>
          </div>

          <div className="flex w-full max-w-[140px] items-center gap-3">
            <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-[#e7e7e7] dark:bg-[#2a2a2a]">
              <div className="absolute left-0 top-0 flex h-full w-[23%] items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"></div>
            </div>
            <p className="font-medium text-[#2a2a2a] text-theme-sm dark:text-white/90">
              23%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

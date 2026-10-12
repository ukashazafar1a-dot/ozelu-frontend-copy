"use client";
import React, { useEffect } from "react";
import Select from "react-select";

export const selectStyles = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "#ededed",
    border: "none",
    boxShadow: "none",
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: "#ededed",
      color: "inherit",
      cursor: "default",
      fontSize: "16px",
      fontWeight: "400",
      paddingTop: "0",
      paddingBottom: "0",
      ":hover": {
        backgroundColor: "#777771",
        color: "#ffffff",
      },
    };
  },
  // input: (styles) => ({ ...styles, backgroundColor:'yellow' }),
  // placeholder: (styles) => ({ ...styles, backgroundColor: 'green' }),
  // singleValue: (styles, { data }) => ({ ...styles, backgroundColor: 'blue' }),
};

/**
 * @param {{
 *   options: any,
 *   value: any,
 *   onChangeHandler: any,
 *   type: any,
 *   placeholder?: string,
 *   controlBg?: string,
 *   optionBg?: string,
 *   isDisabled?: boolean,
 *   noOptionsMessage?: () => string,
 *   menuPortalTarget?: HTMLElement | null,
 * }} props
 */
function SearchableSelect({
  options,
  value,
  onChangeHandler,
  type,
  placeholder = "Select",
  controlBg = "#ededed",
  optionBg = "#ededed",
  isDisabled = false,
  noOptionsMessage = () => "No options",
  menuPortalTarget = null,
}) {
  const selectStylesCustom = {
    control: (styles) => ({
      ...styles,
      backgroundColor: controlBg,
      border: "none",
      boxShadow: "none",
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        backgroundColor: optionBg,
        color: "inherit",
        cursor: "default",
        fontSize: "16px",
        fontWeight: "400",
        paddingTop: "0",
        paddingBottom: "0",
        ":hover": {
          backgroundColor: "#777771",
          color: "#ffffff",
        },
      };
    },
    ...(menuPortalTarget
      ? {
          menu: (styles) => ({
            ...styles,
            backgroundColor: optionBg,
            zIndex: 20,
          }),
          menuPortal: (styles) => ({
            ...styles,
            zIndex: 9999,
          }),
        }
      : {}),
  };

  useEffect(() => {
    //console.log("options",options)
  }, []);

  return (
    <Select
      className="selectOptionsCustom"
      defaultValue={options[0]}
      isSearchable={true}
      isDisabled={isDisabled}
      name="area"
      placeholder={placeholder}
      styles={selectStylesCustom}
      menuPortalTarget={menuPortalTarget || undefined}
      options={options}
      noOptionsMessage={noOptionsMessage}
      value={options?.filter((item) => item?.value === value)}
      onChange={(e) => {
        if (!e) return;
        onChangeHandler(type, e.value);
      }}
    />
  );
}

export default SearchableSelect;

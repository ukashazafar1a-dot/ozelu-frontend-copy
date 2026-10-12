export const modifyFilters = (filters, filtersPosition) => {
  try {
    const sortedFilters = filters?.sort((a, b) => {
      const positionA =
        filtersPosition.find((filter) => filter?._id === a?._id)?.position || 0;
      const positionB =
        filtersPosition.find((filter) => filter?._id === b?._id)?.position || 0;
      return positionA - positionB;
    });
    return sortedFilters;
  } catch (error) {
    return null;
  }
};

export const sortings = [
  // {
  //   label: "Alphabetically, A-Z",
  //   value: "title-ascending",
  // },
  // {
  //   label: "Alphabetically, Z-A",
  //   value: "title-descending",
  // },
  {
    label: "Recommended",
    value: "recommended",
  },
  {
    label: "Price, low to high",
    value: "price:asc",
  },
  {
    label: "Price, high to low",
    value: "price:desc",
  }, //,
  // {
  //   label: "Date, old to new",
  //   value: "created-ascending",
  // },
  // {
  //   label: "Date, new to old",
  //   value: "created-descending",
  // },
];

export function convertParamString(paramString) {
  let field;
  const decodedString = decodeURIComponent(paramString);
  const [key, value] = decodedString.split("=");
  if (key?.includes("filter")) {
    const [filter, tempField] = key
      .split("[")
      .map((str) => str.replace("]", ""));
    field = tempField;
  } else {
    field = key;
  }
  if (value) {
    const result = { label: field, value: value.replaceAll("+", " ") };
    return result;
  } else {
    return;
  }
}

export const sizeChartValues = ["Size", "size"];

export const findVariantsByOption = (variants, option, value) => {
  //console.log('here',variants,option,value)
  return variants.filter((variant) => {
    return (
      variant.title.toLowerCase().includes(value.toLowerCase()) ||
      variant.options.includes(value)
    );
  });
};

export const doesValueExist = (filterSource, value, selected, autoCapture) => {
  const lowerCaseValue = value.toLowerCase();
  if (autoCapture && autoCapture[filterSource]) {
    const autoCaptureValues = autoCapture[filterSource];
    // Use some method to check if any item in autoCaptureValues is equal to the lowerCaseValue
    if (
      autoCaptureValues.some((item) => item.toLowerCase() === lowerCaseValue)
    ) {
      return true;
    }
  }
  if (selected && selected[filterSource]) {
    const selectedValues = selected[filterSource];
    // Use some method to check if any item's value property is equal to the lowerCaseValue
    if (selectedValues.some((item) => item.toLowerCase() === lowerCaseValue)) {
      return true;
    }
  }
  return false;
};

export function getFilterValues(queryParams) {
  const filterValues = {};

  for (const [key, value] of queryParams.entries()) {
    if (!filterValues[key]) {
      filterValues[key] = [];
    }

    if (Array.isArray(value)) {
      // Add unique values to the array
      value.forEach((v) => {
        if (!filterValues[key].includes(v)) {
          filterValues[key].push(v);
        }
      });
    } else {
      // Add unique value to the array
      if (!filterValues[key].includes(value)) {
        filterValues[key].push(value);
      }
    }
  }

  return filterValues;
}

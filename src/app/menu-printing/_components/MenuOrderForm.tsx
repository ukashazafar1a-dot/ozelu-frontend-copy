"use client";
import React, { useRef, useState, useEffect } from "react";
import { Field, Formik, FieldArray, ErrorMessage } from "formik";
import Swal from "sweetalert2";
import axios from "axios";
import ImageDropzone from "../../../components/Dropzones/ImageDropzone";
import Checkout from "../../../components/Checkout";
import SearchableSelect from "../../../components/SearchableSelect";
import useApp from "../../../store/useApp";
import * as Yup from "yup";
import LoadingProgress from "../../../components/LoadingProgress";
import showCustomPopup from "@/components/NoSwal";
import UploadInfoLabel from "@/components/UploadInfoLabel";
import CheckoutActivityFormTracker from "@/components/CheckoutActivityFormTracker";
import OrderTotalPrice from "@/components/OrderTotalPrice";
import DeliveryChargesLine from "@/components/DeliveryChargesLine";
import { MENU_SUPPORTED_TYPES } from "@/constants/uploadSupportedTypes";
import { privacyOptions } from "@/utils";
import {
  checkFreeDelivery,
  generateUniqueKey,
  getDeliveryCharges,
  getValidFiles,
  hasValidFiles,
} from "@/helpers/generals";
import { DeliveryArea, MenuFinishingType, MenuPrice, PageData } from "@/libs/types";
import { sortArrayAlphabetically } from "@/libs/utils";
import { RenderErrorMessage } from "@/components/RenderErrorMessage";
import {
  cityAreaLayer,
  fileUploading,
  formSubmission,
  pushDatalyer,
  pushDropdownLayer,
  pushOrderLayer,
  stripeStart,
} from "@/datalayers/CP";
import FileUploadingStatus from "@/components/FileUploadingStatus";
import FileUploadSummary from "@/components/FileUploadSummary";
import FileUploadProgress from "@/components/FileUploadProgress";

const FORM_NAME = "Menu Printing" as const;

const FALLBACK_FINISHING_TYPES: MenuFinishingType[] = [
  { key: "none", label: "No Finishing", is_none: true },
  { key: "gloss", label: "Gloss Lamination", is_none: false },
  { key: "matte", label: "Matte Lamination", is_none: false },
];

function normalizeStorefrontFinishings(
  list: MenuFinishingType[] | undefined,
): MenuFinishingType[] {
  if (!Array.isArray(list) || list.length === 0) {
    return FALLBACK_FINISHING_TYPES;
  }
  const out: MenuFinishingType[] = [];
  let hasNone = false;
  list.forEach((item, idx) => {
    const label = String(item?.label || "").trim() || `Type ${idx + 1}`;
    const key = String(item?.key || "").trim();
    const isNone =
      item?.is_none === true ||
      key === "none" ||
      key === "not_laminated" ||
      /^no\s+(finishing|lamination)\s*$/i.test(label);
    if (isNone) {
      if (hasNone) return;
      hasNone = true;
      out.push({ key: "none", label: label || "No Finishing", is_none: true });
      return;
    }
    if (!key) return;
    out.push({ key, label, is_none: false });
  });
  if (!hasNone) {
    out.unshift({ key: "none", label: "No Finishing", is_none: true });
  }
  return out;
}

function findLaminationQtyRow(
  size: any,
  laminationPrices: any[] | undefined,
) {
  if (!laminationPrices?.length) return undefined;
  const row = laminationPrices.find(
    (l) =>
      l.menu_type_value === size.menu_type && l.column_key === size.size,
  );
  if (!row) return undefined;
  return row.quantities?.find((q: any) => q.value == size.quantity);
}

/** Empty, whitespace, or Excel-style "-" = not offered. 0 = offered at 0 AED. */
function isBlankChargeableCell(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  const s = String(value).trim();
  if (s === "") return true;
  return /^(?:[-–—]|n\/?a)$/i.test(s);
}

/**
 * Empty/null cell = hide that finishing for this combo.
 * Missing key (not yet priced) is also hidden.
 * 0 = offered at 0 AED. No matrix row: only No Finishing.
 */
function isChargeableFinishingOffered(qtyRow: any, key: string): boolean {
  if (!qtyRow || !key) return false;
  if (!Object.prototype.hasOwnProperty.call(qtyRow, key)) return false;
  return !isBlankChargeableCell(qtyRow[key]);
}

/** Dropdown options with surcharge text from the same matrix used for pricing. */
function buildFinishingSelectOptions(
  size: any,
  laminationPrices: any[] | undefined,
  finishingTypes: MenuFinishingType[],
) {
  const qtyRow = findLaminationQtyRow(size, laminationPrices);
  return finishingTypes
    .map((f) => {
      if (f.is_none || f.key === "none") {
        return {
          value: f.key,
          label: f.label,
          surchargeLabel: null as string | null,
        };
      }
      if (!isChargeableFinishingOffered(qtyRow, f.key)) return null;
      const amount = getLaminationSurcharge(
        { ...size, finishing: f.key },
        laminationPrices,
        finishingTypes,
      );
      return {
        value: f.key,
        label: f.label,
        surchargeLabel:
          typeof amount === "number" && Number.isFinite(amount)
            ? `+ ${amount} AED`
            : null,
      };
    })
    .filter((o): o is NonNullable<typeof o> => o != null);
}

type FinishingSelectOption = {
  value: string;
  label: string;
  surchargeLabel: string | null;
};

function FinishingOptionLabel({
  label,
  surchargeLabel,
}: {
  label: string;
  surchargeLabel?: string | null;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        gap: 16,
        fontFamily: "var(--primary-font, inherit)",
      }}
    >
      <span style={{ fontFamily: "inherit" }}>{label}</span>
      {surchargeLabel ? (
        <span
          style={{
            marginLeft: "auto",
            whiteSpace: "nowrap",
            fontFamily: "inherit",
            fontWeight: 700,
            color: "#6ec1cd",
          }}
        >
          {surchargeLabel}
        </span>
      ) : null}
    </div>
  );
}

function FinishingTypeSelect({
  id,
  options,
  value,
  onChange,
}: {
  id: string;
  options: FinishingSelectOption[];
  value?: FinishingSelectOption;
  onChange: (opt: FinishingSelectOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="menu-finishing-select" ref={wrapRef}>
      <button
        type="button"
        id={id}
        className="selectOptionsCustom new-custom-field-rf menu-finishing-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="menu-finishing-trigger-label">{value?.label || ""}</span>
      </button>
      {open ? (
        <ul className="menu-finishing-list" role="listbox">
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value?.value}
              className={
                opt.value === value?.value
                  ? "menu-finishing-option is-selected"
                  : "menu-finishing-option"
              }
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              <FinishingOptionLabel
                label={opt.label}
                surchargeLabel={opt.surchargeLabel}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

const ValidationSchema = Yup.object().shape({
  firstname: Yup.string().required("Please enter your first name"),
  lastname: Yup.string().required("Please enter your last name"),
  phone: Yup.string().required("Please enter your phone number"),
  address: Yup.string().required("Please enter your address"),
  area: Yup.string().required("Please select your area"),
  city: Yup.string().required("Please select a city"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Please enter your valid email address"),
  privacy: Yup.string().nullable().notRequired(),
  sizes: Yup.array().of(
    Yup.object().shape({
      menu_type: Yup.string().required("Menu Type is required"),
      size: Yup.string().required("Size is required"),
      quantity: Yup.string().required("Quantity is required"),
      finishing: Yup.string().nullable().notRequired(),
    }),
  ),
});

type Props = {
  data: PageData;
  areas: DeliveryArea[] | null;
};

const defaultSize = {
  id: generateUniqueKey(),
  menu_type: "",
  size: "",
  quantity: "",
  finishing: "none",
  files: [],
};

const defaultValues = {
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
  address: "",
  area: "",
  city: "",
  comments: "",
  privacy: "",
  customSize: false,
  sizes: [{ ...defaultSize }],
};

/** Flat lamination surcharge from the matrix for this qty tier (not × quantity). */
function getLaminationSurcharge(
  size: any,
  laminationPrices: any[] | undefined,
  finishingTypes?: MenuFinishingType[],
): number | null {
  const finishing = String(size.finishing || "")
    .toLowerCase()
    .replace(/\s+/g, "_");
  const meta = (finishingTypes || []).find(
    (f) => f.key === finishing || f.key === size.finishing,
  );
  if (
    !finishing ||
    finishing === "none" ||
    finishing === "not_laminated" ||
    meta?.is_none
  ) {
    return 0;
  }
  if (!laminationPrices?.length) return null;
  const row = laminationPrices.find(
    (l) =>
      l.menu_type_value === size.menu_type && l.column_key === size.size,
  );
  if (!row) return null;
  const qtyRow = row.quantities?.find((q: any) => q.value == size.quantity);
  if (!qtyRow) return null;
  const key = meta?.key || size.finishing || finishing;
  if (Object.prototype.hasOwnProperty.call(qtyRow, key)) {
    const surcharge = qtyRow[key];
    if (isBlankChargeableCell(surcharge)) return null;
    if (typeof surcharge === "number" && Number.isFinite(surcharge)) {
      return surcharge;
    }
    const parsed = Number(
      typeof surcharge === "string" ? surcharge.trim() : surcharge,
    );
    return Number.isFinite(parsed) ? parsed : null;
  }
  // Missing key: not offered for this combo (same as empty cell).
  return null;
}

/** Prefer flat columns; fall back to legacy nested paper_types[0]. */
function getMenuColumns(menu: MenuPrice | null | undefined) {
  if (!menu) return [];
  if (Array.isArray(menu.columns) && menu.columns.length > 0) {
    return menu.columns;
  }
  return menu.paper_types?.[0]?.columns || [];
}

/** Returns null when the selection is incomplete or not in the price matrix. */
function calculateSingleSizePrice(
  size: any,
  prices: MenuPrice[],
  laminationPrices?: any[],
  finishingTypes?: MenuFinishingType[],
): number | null {
  if (!size?.menu_type || !size?.size || !size?.quantity) {
    return null;
  }
  const menu = prices.find((p) => p.value === size.menu_type);
  if (!menu) return null;
  const column = getMenuColumns(menu).find((c) => c.key === size.size);
  if (!column) return null;
  const quantityPrice = column.quantities?.find(
    (q) => q.value == size.quantity,
  );
  // Seed/unset cells are 0 — treat as not priced yet (block silent free orders).
  if (
    !quantityPrice ||
    typeof quantityPrice.price !== "number" ||
    quantityPrice.price <= 0
  ) {
    return null;
  }
  const surcharge = getLaminationSurcharge(
    size,
    laminationPrices,
    finishingTypes,
  );
  if (surcharge == null) return null;
  return quantityPrice.price + surcharge;
}

const MenuOrderForm = ({ data, areas }: Props) => {
  const { tryCreateToken, menuPrintingPrices, resetStripeElements, sessionId } =
    useApp();
  const formRef = useRef<any>();
  const [showLoading, setShowLoading] = useState(false);
  const [percentageUploaded, setPercentageUploaded] = useState(0);
  const [price, setPrice] = useState<any>(
    data?.min_price ? data?.min_price : 0,
  );
  const [areaOptions, setAreaOptions] = useState<any>([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [orderValue, setOrderValue] = useState(0);
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<any>(
    data?.free_delivery_threshold ? data?.free_delivery_threshold : 0,
  );
  const [prices, setPrices] = useState<MenuPrice[]>([]);
  const [laminationPrices, setLaminationPrices] = useState<any[]>([]);
  const [finishingTypes, setFinishingTypes] = useState<MenuFinishingType[]>(
    FALLBACK_FINISHING_TYPES,
  );

  const [cityAreaMenuTarget, setCityAreaMenuTarget] =
    useState<HTMLElement | null>(null);
  const [initialValues] = useState<any>(defaultValues);

  useEffect(() => {
    setCityAreaMenuTarget(document.body);
  }, []);

  const resetForm = function () {
    formRef.current.resetForm({
      values: {
        ...defaultValues,
        sizes: [{ ...defaultSize, id: generateUniqueKey() }],
      },
    });
    setPercentageUploaded(0);
    calculatePrice();
    resetStripeElements();
  };

  const getFormikValues = () => {
    const formikValues = formRef.current?.values;
    if (!formikValues) return {};
    return formikValues;
  };

  const calculateGroupedPrices = (sizes: any[], menuPrices: MenuPrice[]) => {
    const groupedPrices: Record<string, any> = {};

    sizes.forEach((size) => {
      const key = `${size.menu_type}-${size.size}-${size.quantity}-${size.finishing}`;
      const linePrice = calculateSingleSizePrice(
        size,
        menuPrices,
        laminationPrices,
        finishingTypes,
      );
      if (linePrice == null) return;

      const menu = menuPrices.find((p) => p.value === size.menu_type);
      const column = getMenuColumns(menu).find((c) => c.key === size.size);
      const quantityPrice = column?.quantities?.find(
        (q) => q.value == size.quantity,
      );
      const basePrice =
        quantityPrice && typeof quantityPrice.price === "number"
          ? quantityPrice.price
          : 0;
      const laminationPrice =
        getLaminationSurcharge(size, laminationPrices, finishingTypes) ?? 0;
      const qty = Number(size.quantity) || 0;

      if (!groupedPrices[key]) {
        groupedPrices[key] = {
          menu_type: size.menu_type,
          size: size.size,
          quantity: qty,
          finishing: size.finishing,
          basePrice,
          laminationPrice,
          price: linePrice,
        };
      } else {
        // Keep qty in sync when identical lines merge so unit price stays correct
        groupedPrices[key].basePrice += basePrice;
        groupedPrices[key].laminationPrice += laminationPrice;
        groupedPrices[key].price += linePrice;
        groupedPrices[key].quantity += qty;
      }
    });

    return Object.values(groupedPrices);
  };

  function calculateTotalPrice(sizes: any, menuPrices: MenuPrice[]) {
    let totalPrice = 0;
    sizes.forEach((size: any) => {
      if (size.hasOwnProperty("isSelected") && !size.isSelected) return;
      const line = calculateSingleSizePrice(
        size,
        menuPrices,
        laminationPrices,
        finishingTypes,
      );
      if (line == null) return;
      totalPrice += line;
    });
    return totalPrice;
  }

  function hasInvalidLinePricing(sizes: any[]) {
    return (sizes || []).some((size: any) => {
      if (size.hasOwnProperty("isSelected") && !size.isSelected) return false;
      if (!size?.menu_type || !size?.size || !size?.quantity) {
        return true;
      }
      return (
        calculateSingleSizePrice(
          size,
          prices,
          laminationPrices,
          finishingTypes,
        ) == null
      );
    });
  }

  function calculatePrice() {
    setTimeout(() => {
      setPrice(0);
      setOrderValue(0);
      let newOrderValue = 0;
      let newDeliveryCharges = 0;
      const { sizes, area } = getFormikValues();

      let value = newOrderValue + calculateTotalPrice(sizes, prices);
      value = parseFloat(value.toFixed(2));
      newOrderValue = value;

      const minPrice =
        typeof data?.min_price === "number" ? data.min_price : 0;
      if (minPrice > 0 && newOrderValue < minPrice) {
        newOrderValue = minPrice;
      }

      setOrderValue(newOrderValue);
      setPrice(newOrderValue);

      if (checkFreeDelivery(newOrderValue, freeDeliveryThreshold)) {
        newDeliveryCharges = 0;
      } else {
        newDeliveryCharges = getDeliveryCharges(
          menuPrintingPrices,
          area,
          areas,
        );
      }

      setDeliveryCharges(newDeliveryCharges);
    }, 100);
  }

  function onSubmit() {
    if (!data?.isActive) {
      showCustomPopup(data?.alert_message);
      return;
    }
    formSubmission(FORM_NAME, "form_submission_error");
    const {
      firstname,
      lastname,
      email,
      phone,
      address,
      area,
      city,
      comments,
      privacy,
      sizes,
    } = getFormikValues();

    if (hasInvalidLinePricing(sizes)) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please choose a valid Menu Type, Size and Quantity with a listed price. If you selected lamination, that option must also be priced.",
        showLoaderOnConfirm: false,
        showLoaderOnDeny: false,
        loaderHtml: `<div></div>`,
      });
      formSubmission(FORM_NAME, "form_submission_error", {
        title: "Validation Error",
        text: "Invalid menu pricing selection",
      });
      return;
    }

    let haveFiles = hasValidFiles(sizes);
    if (!haveFiles) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please upload your menu artwork files!",
        showLoaderOnConfirm: false,
        showLoaderOnDeny: false,
        loaderHtml: `<div></div>`,
      });
      formSubmission(FORM_NAME, "form_submission_error", {
        title: "Validation Error",
        text: "Please upload your menu artwork files!",
      });
      return;
    }

    setShowLoading(true);
    tryCreateToken().then(async (token: any) => {
      stripeStart(FORM_NAME);
      if (token === undefined || token === "") {
        formSubmission(FORM_NAME, "form_submission_error", {
          text: "Error while getting token",
        });
        setShowLoading(false);
      } else {
        const formData = new FormData();
        let filesMetaData: any = [];
        let sizesMetaData: any = [];

        sizes &&
          sizes?.forEach((size: any, index: any) => {
            const menu = prices.find((item) => item.value === size?.menu_type);
            const column = getMenuColumns(menu).find((c) => c.key === size.size);
            const name = column?.label || column?.open_size_label || size.size;
            const nameWithSize = `${name}_${size.menu_type + size.size + size.quantity + (size.finishing || "") + index}`;

            const validFiles = getValidFiles(size.files);

            validFiles.forEach((file: any) => {
              const extension = file.name.split(".").pop();
              const filename = `${file.name
                .split(".")
                .slice(0, -1)
                .join(".")}_${name}.${extension}`;
              filesMetaData.push({
                filename,
                url: file.url,
                key: file.key,
                size: nameWithSize,
              });
            });
            const linePrice =
              calculateSingleSizePrice(
                size,
                prices,
                laminationPrices,
                finishingTypes,
              ) ?? 0;
            const finishingPrice =
              getLaminationSurcharge(
                size,
                laminationPrices,
                finishingTypes,
              ) ?? 0;
            const qty = Number(size.quantity) || 0;
            const basePrice = Number((linePrice - finishingPrice).toFixed(2));
            sizesMetaData.push({
              size: nameWithSize,
              name: column?.label || name,
              type: menu?.label || size.menu_type,
              menu_type: size.menu_type,
              size_key: size.size,
              quantity: size.quantity,
              finishing: {
                value: size.finishing || "none",
                label:
                  finishingTypes.find((f) => f.key === size.finishing)?.label ||
                  size.finishing ||
                  "No Finishing",
                price: finishingPrice,
              },
              price: linePrice,
              unit_price:
                qty > 0 ? parseFloat((basePrice / qty).toFixed(2)) : basePrice,
            });
          });
        fileUploading(FORM_NAME, filesMetaData, "started");
        formData.append("order_type", "menu_print");
        formData.append("firstname", firstname);
        formData.append("lastname", lastname);
        formData.append("email", email);
        formData.append("phone", phone);
        formData.append("address", address);
        formData.append("area", area);
        formData.append("city", city);
        formData.append("comments", comments);
        formData.append("filesData", JSON.stringify(filesMetaData));
        formData.append("sizesData", JSON.stringify(sizesMetaData));
        formData.append("privacy", privacy);
        formData.append(
          "price",
          parseFloat(price + deliveryCharges).toFixed(2),
        );
        formData.append("token", token.id);
        if (sessionId) formData.append("session_id", sessionId);
        formData.append(
          "delivery_charges",
          String(deliveryCharges),
        );
        formData.append(
          "free_delivery",
          String(checkFreeDelivery(price, freeDeliveryThreshold)),
        );

        try {
          const { data } = await axios({
            data: formData,
            method: "post",
            url: process.env.NEXT_PUBLIC_API_URL + "/api/createOrder",
            headers: {
              "Content-Type": "application/json",
            },
            onUploadProgress: (progressEvent: any) => {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setPercentageUploaded(progress);
            },
          });

          fileUploading(FORM_NAME, filesMetaData, "completed");
          const { order_id, customer_id } = data;

          axios
            .post(process.env.NEXT_PUBLIC_API_URL + "/api/stripe/pay", {
              order_id,
              customer_id,
              session_id: sessionId,
            })
            .then((response) => {
              if (response.data.status) {
                setShowLoading(false);
                Swal.fire({
                  title: "Order Placed!",
                  text: "Please check Your Email!",
                  icon: "success",
                  showLoaderOnConfirm: false,
                  showLoaderOnDeny: false,
                  loaderHtml: `<div></div>`,
                });
                const { object } = response?.data;
                pushOrderLayer(FORM_NAME, object);
                resetForm();
              } else {
                setShowLoading(false);
                Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text:
                    response?.data?.message ||
                    "Failed to collect your payment.",
                  showLoaderOnConfirm: false,
                  showLoaderOnDeny: false,
                  loaderHtml: `<div></div>`,
                });
                formSubmission(FORM_NAME, "form_submission_error", {
                  title: "Oops...",
                  text:
                    response?.data?.message ||
                    "Failed to collect your payment.",
                });
              }
            })
            .catch((err) => {
              setShowLoading(false);
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text:
                  err?.response?.data?.message ||
                  "Failed to collect your payment.",
                showLoaderOnConfirm: false,
                showLoaderOnDeny: false,
                loaderHtml: `<div></div>`,
              });
              formSubmission(FORM_NAME, "form_submission_error", {
                title: "Oops...",
                text:
                  err?.response?.data?.message ||
                  "Failed to collect your payment.",
              });
            });
        } catch (error: any) {
          setShowLoading(false);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: `${
              error?.response?.data?.message ||
              `Please check the form if you have filled all the fields and the files you uploaded are in the right formats. If error still persists, please contact us on care@ozelu.com or WhatsApp us. Or try submitting again as it might just be your internet speed and if it still doesn't work, please don't hesitate to get in touch with us.`
            }`,
            showLoaderOnConfirm: false,
            showLoaderOnDeny: false,
            loaderHtml: `<div></div>`,
          });
          formSubmission(FORM_NAME, "form_submission_error", {
            title: "Oops...",
            text: `${
              error?.response?.data?.message ||
              `Please check the form if you have filled all the fields and the files you uploaded are in the right formats.`
            }`,
          });
        }
      }
    });
  }

  async function setValueCalculatePrice(type: any, value: any) {
    cityAreaLayer(FORM_NAME, type, value);
    if (type === "city") {
      formRef.current.setFieldValue("area", "");
      const filteredAreas = areas?.filter((area: any) => area?.city === value);
      const sortedAreas = filteredAreas?.sort((a: any, b: any) => {
        if (a?.name < b?.name) return -1;
        if (a?.name > b?.name) return 1;
        return 0;
      });
      const options = sortedAreas?.map((area: any) => ({
        value: area?.name,
        label: area?.name,
      }));
      setAreaOptions(options);
    }
    formRef.current.setFieldValue(type, value);
    await Promise.resolve();
    calculatePrice();
  }

  function addMenu(arrayHelpers: any) {
    arrayHelpers.push({ ...defaultSize, id: generateUniqueKey() });
  }

  function getColumns(menuType: string) {
    const menu = prices.find((p) => p.value === menuType);
    return getMenuColumns(menu);
  }

  function getQuantities(menuType: string, sizeKey: string) {
    const column = getColumns(menuType).find((c) => c.key === sizeKey);
    return column?.quantities?.map((q) => q.value) || [];
  }

  function renderPrices(sizes: any[]) {
    const sizePrices = calculateGroupedPrices(sizes, prices);
    if (!sizes || sizePrices.length === 0) {
      return "";
    }
    return sizePrices.map((size: any, index: any) => {
      const menu = prices.find((item) => item.value === size?.menu_type);
      const column = getMenuColumns(menu).find((c) => c.key === size.size);
      if (price === 0 || !menu || !column) return "";
      const finishingOpt = finishingTypes.find(
        (f) => f.key === size.finishing,
      );
      const showLamination =
        !!finishingOpt &&
        !finishingOpt.is_none &&
        finishingOpt.key !== "none";
      const baseLabel = (
        <>
          {menu.label}
          {" - "}
          {column.label}
        </>
      );
      const qty = Number(size.quantity) || 0;
      const baseTotal = Number(size.basePrice) || 0;
      const unitPrice =
        qty > 0 ? parseFloat((baseTotal / qty).toFixed(2)) : baseTotal;
      return (
        <React.Fragment key={index}>
          <p>
            {baseLabel}: {size.quantity} Prints x {unitPrice} AED ={" "}
            {size.basePrice}
            {" AED"}
          </p>
          {showLamination && finishingOpt ? (
            <p>
              {finishingOpt.label}: = {size.laminationPrice}
              {" AED"}
            </p>
          ) : null}
        </React.Fragment>
      );
    });
  }

  function renderDeliveryCharges() {
    const { area = null } = getFormikValues();
    return (
      <DeliveryChargesLine
        areaCharge={getDeliveryCharges(menuPrintingPrices, area, areas)}
        orderPrice={price}
        threshold={freeDeliveryThreshold}
        hasArea={Boolean(area)}
      />
    );
  }

  function getAllFiles() {
    const { sizes } = getFormikValues();
    const files = (sizes || []).flatMap((size: any) =>
      Array.isArray(size.files) ? size.files : [],
    );
    return files;
  }

  function renderFileUploadSummary() {
    const files = getAllFiles();
    return <FileUploadSummary files={files} />;
  }

  function renderFileUploadProgress() {
    const files = getAllFiles();
    return <FileUploadProgress files={files} />;
  }

  useEffect(() => {
    if (!areas) return;
    const sortedAreas = sortArrayAlphabetically(areas);
    let options: any = sortedAreas?.map((area: any) => ({
      value: area.name,
      label: area.name,
    }));
    setAreaOptions(options);
  }, [areas]);

  useEffect(() => {
    setPrice(data?.min_price ? data?.min_price : 0);
    if (data?.menu_prices && data.menu_prices.length > 0) {
      setPrices(data.menu_prices);
    }
    if (data?.menu_lamination_prices) {
      setLaminationPrices(data.menu_lamination_prices);
    }
    setFinishingTypes(
      normalizeStorefrontFinishings(data?.menu_finishing_types),
    );
  }, [data]);

  useEffect(() => {
    if (!areas) return;
    let allCities: any = [];
    let allAreas: any = [];
    areas?.forEach((area: any) => {
      if (!allCities?.includes(area?.city)) {
        allCities?.push(area?.city);
      }
    });
    let optionsTwo: any = allCities.sort().map((city: any) => ({
      value: city,
      label: city,
    }));

    const firstCity = optionsTwo[0];
    areas.forEach((area: any) => {
      if (area?.city === firstCity?.value) {
        allAreas.push({ value: area?.name, label: area?.name });
      }
    });
    if (formRef.current) {
      formRef.current.setFieldValue("city", firstCity?.value);
    }
    const sortedAreas = sortArrayAlphabetically(allAreas);
    setAreaOptions(sortedAreas);
    setCityOptions(optionsTwo);
  }, []);

  return (
    <div
      className="photo-printing-form--wrapper order-form--wrapper"
      id="orderForm"
    >
      {showLoading && <LoadingProgress loaded={percentageUploaded} />}
      <Formik
        innerRef={formRef}
        initialValues={initialValues}
        validationSchema={ValidationSchema}
        validate={() => {
          calculatePrice();
        }}
        onSubmit={() => {
          onSubmit();
        }}
      >
        {({
          values,
          errors,
          touched,
          handleSubmit,
          handleChange,
          setFieldValue,
          setFieldTouched,
          validateForm,
        }) => {
          return (
            <form
              className="order-form container mb-5"
              onSubmit={(event) => {
                event.preventDefault();
                validateForm().then((errors) => {
                  if (errors && Object.keys(errors).length !== 0) {
                    Swal.fire({
                      icon: "error",
                      title: "Validation Error",
                      text: `Please fill all fields!`,
                      showLoaderOnConfirm: false,
                      showLoaderOnDeny: false,
                      loaderHtml: `<div></div>`,
                    });
                    formSubmission(FORM_NAME, "form_submission_error", {
                      title: "Validation Error",
                      text: `Please fill all fields!`,
                      errors,
                    });
                    handleSubmit();
                  } else {
                    handleSubmit();
                  }
                });
              }}
            >
              <CheckoutActivityFormTracker orderType="MENU_PRINT" />
              <div className="contactSection" id="photos">
                <h2 className="heading-h2 text-center my-4 mx-0">
                  Fill The Form Below To Place An Order
                </h2>
                <div className="formContainer">
                  <div className="formControll">
                    <label htmlFor="firstname">First Name</label>
                    <input
                      data-formControlName="firstname"
                      type="text"
                      value={values.firstname}
                      onChange={handleChange}
                      onFocus={() => pushDatalyer(FORM_NAME, "First Name")}
                      placeholder="Please Write Your First Name"
                      name="firstname"
                      id="firstname"
                    />
                    <RenderErrorMessage
                      errors={errors}
                      touches={touched}
                      name={`firstname`}
                    />
                  </div>

                  <div className="formControll">
                    <label htmlFor="lastname">Last Name</label>
                    <input
                      data-formControlName="lastname"
                      type="text"
                      value={values.lastname}
                      onChange={handleChange}
                      onFocus={() => pushDatalyer(FORM_NAME, "Last Name")}
                      placeholder="Please Write Your Last Name"
                      name="lastname"
                      id="lastname"
                    />
                    <RenderErrorMessage
                      errors={errors}
                      touches={touched}
                      name={`lastname`}
                    />
                  </div>

                  <div className="formControll">
                    <label htmlFor="email">Email</label>
                    <input
                      data-formControlName="email"
                      type="email"
                      id="email"
                      value={values.email}
                      onChange={handleChange}
                      onFocus={() => pushDatalyer(FORM_NAME, "Email")}
                      placeholder="Please Write Your Email"
                      name="email"
                    />
                    <RenderErrorMessage
                      errors={errors}
                      touches={touched}
                      name={`email`}
                    />
                  </div>

                  <div className="formControll">
                    <label htmlFor="pnumber">
                      Phone Number (Preferably With WhatsApp)
                    </label>
                    <input
                      data-formControlName="phone"
                      type="tel"
                      id="pnumber"
                      placeholder="Please Write Your Phone Number"
                      name="phone"
                      value={values.phone}
                      onChange={handleChange}
                      onFocus={() => pushDatalyer(FORM_NAME, "Phone Number")}
                    />
                    <RenderErrorMessage
                      errors={errors}
                      touches={touched}
                      name={`phone`}
                    />
                  </div>
                  <div className="formControll">
                    <label htmlFor="city">City</label>
                    <SearchableSelect
                      value={values.city}
                      type="city"
                      onChangeHandler={setValueCalculatePrice}
                      options={cityOptions}
                      menuPortalTarget={cityAreaMenuTarget}
                    />
                    <RenderErrorMessage
                      errors={errors}
                      touches={touched}
                      name={`city`}
                    />
                  </div>
                  <div className="formControll">
                    <label htmlFor="area">Area</label>
                    <SearchableSelect
                      value={values.area}
                      type="area"
                      onChangeHandler={setValueCalculatePrice}
                      options={areaOptions}
                      menuPortalTarget={cityAreaMenuTarget}
                    />
                    <RenderErrorMessage
                      errors={errors}
                      touches={touched}
                      name={`area`}
                    />
                  </div>
                  <div className="formControll">
                    <label htmlFor="address">
                      Address (Please Don&apos;t Put Work/Office Address -
                      Preferably Home)
                    </label>
                    <input
                      data-formControlName="address"
                      type="text"
                      value={values.address}
                      onChange={handleChange}
                      onFocus={() => pushDatalyer(FORM_NAME, "Address")}
                      id="address"
                      name="address"
                      placeholder="Please Write Your Address"
                    />
                    <RenderErrorMessage
                      errors={errors}
                      touches={touched}
                      name={`address`}
                    />
                  </div>
                  <div className="formControll">
                    <label htmlFor="privacy">Privacy Preference</label>
                    <Field
                      as="select"
                      id="privacy"
                      name="privacy"
                      className="selectOptionsCustom new-custom-field-rf"
                      value={values.privacy}
                      onChange={(e: any) => {
                        handleChange(e);
                        pushDropdownLayer(
                          FORM_NAME,
                          "Privacy Preference",
                          e.target?.value,
                        );
                      }}
                      onFocus={() =>
                        pushDatalyer(FORM_NAME, "Privacy Preference")
                      }
                    >
                      <option
                        value=""
                        label="Choose Your Privacy Preference"
                        disabled
                      />
                      {privacyOptions?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Field>
                    <RenderErrorMessage
                      errors={errors}
                      touches={touched}
                      name={`privacy`}
                    />
                  </div>
                </div>

                <div className="formControll mt-3">
                  <FieldArray
                    name="sizes"
                    render={(arrayHelpers) => {
                      return (
                        <>
                          {values.sizes && values.sizes.length > 0 && (
                            <>
                              {values.sizes.map((size: any, index: any) => {
                                const columns = getColumns(size.menu_type);
                                const quantities = getQuantities(
                                  size.menu_type,
                                  size.size,
                                );
                                return (
                                  <div
                                    className="custom-sizes-container"
                                    key={size.id}
                                  >
                                    <div className="formContainer">
                                      {values.sizes.length > 1 && (
                                        <>
                                          <div></div>
                                          <div className="d-flex w-full align-items-end justify-content-end">
                                            <div
                                              className="remove-btn-wrapper"
                                              onClick={() =>
                                                arrayHelpers.remove(index)
                                              }
                                            >
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="#e58383"
                                                height="32"
                                                width="32"
                                                viewBox="0 -960 960 960"
                                              >
                                                <path d="m376-300 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Zm-96 180q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Zm-400 0v520-520Z" />
                                              </svg>
                                            </div>
                                          </div>
                                        </>
                                      )}
                                      <div className="formControll">
                                        <label
                                          htmlFor={`menuType-${index}`}
                                          className="menu-print-option-label"
                                        >
                                          Menu Type
                                        </label>
                                        <Field
                                          as="select"
                                          id={`menuType-${index}`}
                                          name={`sizes[${index}].menu_type`}
                                          className="selectOptionsCustom new-custom-field-rf"
                                          onChange={(e: any) => {
                                            handleChange(e);
                                            setFieldValue(
                                              `sizes[${index}].size`,
                                              "",
                                            );
                                            setFieldValue(
                                              `sizes[${index}].quantity`,
                                              "",
                                            );
                                            setFieldValue(
                                              `sizes[${index}].finishing`,
                                              "none",
                                            );
                                            pushDropdownLayer(
                                              FORM_NAME,
                                              "Menu Type",
                                              e.target?.value,
                                            );
                                          }}
                                        >
                                          <option
                                            value={""}
                                            label="Choose Your Menu Type"
                                            disabled
                                          />
                                          {prices.map((m) => (
                                            <option
                                              key={m.value}
                                              value={m.value}
                                            >
                                              {m.label}
                                            </option>
                                          ))}
                                        </Field>
                                        <RenderErrorMessage
                                          errors={errors}
                                          touches={touched}
                                          name={`sizes[${index}].menu_type`}
                                        />
                                      </div>
                                      <div className="formControll">
                                        <label
                                          htmlFor={`menuSize-${index}`}
                                          className="menu-print-option-label"
                                        >
                                          Size
                                        </label>
                                        <Field
                                          as="select"
                                          id={`menuSize-${index}`}
                                          name={`sizes[${index}].size`}
                                          className="selectOptionsCustom new-custom-field-rf"
                                          onChange={(e: any) => {
                                            handleChange(e);
                                            setFieldValue(
                                              `sizes[${index}].quantity`,
                                              "",
                                            );
                                            setFieldValue(
                                              `sizes[${index}].finishing`,
                                              "none",
                                            );
                                            const col = columns.find(
                                              (c) => c.key === e.target?.value,
                                            );
                                            pushDropdownLayer(
                                              FORM_NAME,
                                              "Size",
                                              col?.label || e.target?.value || "",
                                            );
                                          }}
                                        >
                                          <option
                                            value=""
                                            label="Choose Your Size"
                                            disabled
                                          />
                                          {columns.map((c) => (
                                            <option key={c.key} value={c.key}>
                                              {c.label}
                                            </option>
                                          ))}
                                        </Field>
                                        <RenderErrorMessage
                                          errors={errors}
                                          touches={touched}
                                          name={`sizes[${index}].size`}
                                        />
                                      </div>
                                      <div className="formControll">
                                        <label
                                          htmlFor={`quantity-${index}`}
                                          className="menu-print-option-label"
                                        >
                                          Quantity
                                        </label>
                                        <Field
                                          as="select"
                                          id={`quantity-${index}`}
                                          name={`sizes[${index}].quantity`}
                                          className="selectOptionsCustom new-custom-field-rf"
                                          onChange={(e: any) => {
                                            handleChange(e);
                                            const nextQty = e.target?.value;
                                            const qtyRow = findLaminationQtyRow(
                                              { ...size, quantity: nextQty },
                                              laminationPrices,
                                            );
                                            if (
                                              size.finishing &&
                                              size.finishing !== "none" &&
                                              !isChargeableFinishingOffered(
                                                qtyRow,
                                                size.finishing,
                                              )
                                            ) {
                                              setFieldValue(
                                                `sizes[${index}].finishing`,
                                                "none",
                                              );
                                            }
                                            pushDropdownLayer(
                                              FORM_NAME,
                                              "Quantity",
                                              nextQty,
                                            );
                                          }}
                                        >
                                          <option
                                            value=""
                                            label="Choose Number of Menu Prints"
                                            disabled
                                          />
                                          {quantities.map((q: any) => (
                                            <option key={q} value={q}>
                                              {q}
                                            </option>
                                          ))}
                                        </Field>
                                        <RenderErrorMessage
                                          errors={errors}
                                          touches={touched}
                                          name={`sizes[${index}].quantity`}
                                        />
                                      </div>
                                      <div className="formControll">
                                        <label
                                          htmlFor={`finishing-${index}`}
                                          className="menu-print-option-label"
                                        >
                                          Finishing Type - Optional
                                        </label>
                                        {(() => {
                                          const finishingOpts =
                                            buildFinishingSelectOptions(
                                              size,
                                              laminationPrices,
                                              finishingTypes,
                                            );
                                          const selected =
                                            finishingOpts.find(
                                              (o) => o.value === size.finishing,
                                            ) || finishingOpts[0];
                                          return (
                                            <FinishingTypeSelect
                                              id={`finishing-${index}`}
                                              options={finishingOpts}
                                              value={selected}
                                              onChange={(opt) => {
                                                const next =
                                                  opt?.value || "none";
                                                setFieldValue(
                                                  `sizes[${index}].finishing`,
                                                  next,
                                                );
                                                pushDropdownLayer(
                                                  FORM_NAME,
                                                  "Finishing",
                                                  next,
                                                );
                                              }}
                                            />
                                          );
                                        })()}
                                      </div>
                                    </div>
                                    <div className="custom-dropzone--container formControll upload-zone-after-fields">
                                      <label style={{ margin: 0 }}>
                                        <FileUploadingStatus
                                          files={size.files}
                                        />
                                      </label>
                                      <ImageDropzone
                                        orderType="MENU_PRINT"
                                        files={size.files}
                                        setFiles={(files: any) => {
                                          setFieldValue(
                                            `sizes[${index}].files`,
                                            files,
                                          );
                                          setFieldTouched(
                                            `sizes[${index}].files`,
                                            true,
                                            true,
                                          );
                                          calculatePrice();
                                        }}
                                        zoom={true}
                                        page="psp-page"
                                        allowAllFileTypes={true}
                                      />
                                      <UploadInfoLabel
                                        supportedTypes={MENU_SUPPORTED_TYPES}
                                      />
                                      <ErrorMessage name={`files`}>
                                        {() => (
                                          <div className="inputError">
                                            <div className="arrow-up"></div>
                                            <span>
                                              <img
                                                className="errorImage"
                                                src={"/images/images/error.jpeg"}
                                                alt="error image"
                                                loading="lazy"
                                              />
                                            </span>{" "}
                                            Per file size should not exceed
                                            10MB, please use an online tool to
                                            compress the photos greater than
                                            10MB and re-upload
                                          </div>
                                        )}
                                      </ErrorMessage>
                                    </div>
                                  </div>
                                );
                              })}
                            </>
                          )}
                          <div className="formControll mt-3 mb-1">
                            <button
                              className="btn--primary-new "
                              type="button"
                              style={{ width: "fit-content" }}
                              onClick={() => addMenu(arrayHelpers)}
                            >
                              Add Another Menu
                            </button>
                          </div>
                        </>
                      );
                    }}
                  />
                </div>

                <div className="formControll mt-1">
                  <div className="formControll any-comments">
                    <label htmlFor="people">Any Comments</label>
                    <textarea
                      data-formControlName="comments"
                      typeof="textarea"
                      value={values.comments}
                      onFocus={() => pushDatalyer(FORM_NAME, "Any Comments")}
                      onChange={handleChange}
                      id="comments"
                      name="comments"
                    />
                  </div>
                  <label htmlFor="people">Price</label>
                  <input
                    readOnly
                    data-formControlName="price"
                    value={price + deliveryCharges}
                    type="number"
                    id="people"
                    name="people"
                  />
                  <div className="order-summary">
                    {renderPrices(values?.sizes)}
                    {renderDeliveryCharges()}
                    <OrderTotalPrice total={price + deliveryCharges} />
                  </div>
                </div>
                {renderFileUploadSummary()}
              </div>

              <div id="form-container" className="formControll payment-form">
                <Checkout />
                {renderFileUploadProgress()}
                <div className="submit-button">
                  <button type="submit" id="tap-btn">
                    Submit
                  </button>
                </div>
              </div>
            </form>
          );
        }}
      </Formik>
    </div>
  );
};

export default MenuOrderForm;

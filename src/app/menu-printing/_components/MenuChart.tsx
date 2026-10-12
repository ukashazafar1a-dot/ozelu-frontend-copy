"use client";
import SectionLoader from "@/components/Loader/SectionLoader";
import { selectStyles } from "@/components/SearchableSelect";
import { MenuPrice, MenuPriceColumn, PageData } from "@/libs/types";
import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";

type Props = {
  data: PageData;
};

/** Menu Printing chart dropdown only — one-line labels; list matches control width. */
const chartSelectStyles = {
  ...selectStyles,
  container: (styles: any) => ({
    ...styles,
    width: "100%",
  }),
  control: (styles: any) => ({
    ...selectStyles.control(styles),
    width: "100%",
  }),
  singleValue: (styles: any) => ({
    ...styles,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  }),
  menu: (styles: any) => ({
    ...styles,
    zIndex: 40,
    backgroundColor: "#ededed",
  }),
  menuPortal: (styles: any) => ({
    ...styles,
    zIndex: 9999,
  }),
  option: (styles: any, state: any) => ({
    ...selectStyles.option(styles, state),
    whiteSpace: "nowrap",
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
  }),
};

/** Prefer flat columns; fall back to legacy nested paper_types[0]. */
const getMenuColumns = (menu: MenuPrice | null): MenuPriceColumn[] => {
  if (!menu) return [];
  if (Array.isArray(menu.columns) && menu.columns.length > 0) {
    return menu.columns;
  }
  return menu.paper_types?.[0]?.columns || [];
};

const getQuantitiesForMenu = (menu: MenuPrice | null): number[] => {
  const columns = getMenuColumns(menu);
  if (!columns.length) return [];
  const quantitySet = new Set<number>();
  columns.forEach((column) => {
    column.quantities?.forEach((q) => {
      quantitySet.add(q.value);
    });
  });
  return Array.from(quantitySet).sort((a, b) => a - b);
};

const getCellPrice = (
  column: MenuPriceColumn,
  quantity: number,
): number | null => {
  const q = column.quantities?.find((item) => item.value === quantity);
  if (!q || typeof q.price !== "number" || q.price <= 0) return null;
  return q.price;
};

const getPerPiece = (total: number | null, quantity: number): number | null => {
  if (total == null || !quantity) return null;
  return parseFloat((total / quantity).toFixed(2));
};

const MenuChart = ({ data }: Props) => {
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState<MenuPrice[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuPrice | null>(null);
  const [menuPortalTarget, setMenuPortalTarget] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    setMenuPortalTarget(document.body);
  }, []);

  useEffect(() => {
    if (data?.menu_prices && data.menu_prices.length > 0) {
      setMenus(data.menu_prices);
      setSelectedMenu(data.menu_prices[0]);
    }
    setLoading(false);
  }, [data]);

  const quantities = useMemo(
    () => getQuantitiesForMenu(selectedMenu),
    [selectedMenu],
  );

  const columns = useMemo(
    () => getMenuColumns(selectedMenu),
    [selectedMenu],
  );

  if (loading) return <SectionLoader />;
  if (!menus.length || !selectedMenu || !quantities.length) {
    return null;
  }

  return (
    <>
      {/*
        Scoped to Menu Printing chart only: wide enough for labels like
        "Flat Take Out Menus - 135GSM Matte" on one line; open list = control width.
      */}
      <style>{`
        .menu-chart-filters {
          width: 100%;
        }
        .menu-chart-filters .menu-chart-type-select {
          width: min(100%, 28rem);
          max-width: 100%;
          margin-left: auto;
          margin-right: auto;
        }
        .menu-chart-filters .menu-chart-type-select .selectOptionsCustom-chart {
          width: 100% !important;
          max-width: none !important;
          min-width: 250px !important;
          margin-left: auto;
          margin-right: auto;
          display: block;
        }
      `}</style>
      <div className="align-items-center d-flex justify-content-center text-center flex-wrap menu-chart-filters">
        <div className="formControll menu-chart-type-select">
          <Select
            options={menus.map((m) => ({ value: m.value, label: m.label }))}
            value={{ value: selectedMenu.value, label: selectedMenu.label }}
            onChange={(e: any) => {
              const next = menus.find((m) => m.value === e?.value);
              if (next) setSelectedMenu(next);
            }}
            placeholder="Choose Your Menu Type"
            className="selectOptionsCustom-chart"
            styles={chartSelectStyles}
            menuPortalTarget={menuPortalTarget}
            menuPosition="fixed"
            isClearable={false}
          />
        </div>
      </div>
      <div className="service-page-chart-wrapper">
        <div className="dp-table-inside text-center mb-5 pt-3">
          <table className="sizes-table table">
            <thead>
              <tr>
                <th className="align-middle">Quantity</th>
                {columns.map((column) => (
                  <th className="align-middle" key={column.key}>
                    {column.label}
                    <br />
                    Price (AED)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quantities.map((quantity) => (
                <tr key={quantity}>
                  <td className="align-middle">{quantity}</td>
                  {columns.map((column) => {
                    const total = getCellPrice(column, quantity);
                    const perPiece = getPerPiece(total, quantity);
                    return (
                      <td key={column.key} className="align-middle">
                        <div className="fw-medium">{total ?? "N/A"}</div>
                        <div className="text-xs">
                          {perPiece != null ? `${perPiece} / Piece` : "N/A"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default MenuChart;

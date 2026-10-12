"use client";
import { selectStyles } from "@/components/SearchableSelect";
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import SizeGrid from "./SizeGrid";
import SectionLoader from "@/components/Loader/SectionLoader";
import { htmlDecode } from "@/helpers/generals";
import axios from "axios";

const PHOTO_REQUIREMENTS_API =
  process.env.NEXT_PUBLIC_API_URL + "/api/assets/photo-requirements-pages";

const DEFAULT_COUNTRY_CANDIDATES = ["United Arab Emirates", "UAE"];

function pickDefaultCountry(countries: string[]) {
  if (!countries.length) return null;
  for (const candidate of DEFAULT_COUNTRY_CANDIDATES) {
    const match = countries.find((country) => country === candidate);
    if (match) return match;
  }
  return countries[0];
}

const PhotoSizeChart = ({ section }: any) => {
  const [selectedPages, setSelectedPages] = useState<any>(null);
  const [passportSizeCountries, setPassportSizeCountries] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const selectRef = useRef<any>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const loadPagesForCountry = async (country: string) => {
    setSelectedValue(country);
    setLoading(true);
    setSelectedPages(null);

    try {
      const { data } = await axios.get(
        `${PHOTO_REQUIREMENTS_API}?country=${encodeURIComponent(country)}`
      );
      setSelectedPages(Array.isArray(data?.pages) ? data.pages : []);
    } catch (error) {
      console.log("Failed to load passport size chart", error);
      setSelectedPages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadCountries = async () => {
      try {
        const { data } = await axios.get(
          `${PHOTO_REQUIREMENTS_API}?countriesOnly=true`
        );
        if (cancelled || !Array.isArray(data?.countries)) return;

        const countries = data.countries as string[];
        setPassportSizeCountries(
          countries.map((country: string) => ({
            value: country,
            label: country,
          }))
        );

        const defaultCountry = pickDefaultCountry(countries);
        if (defaultCountry && !cancelled) {
          await loadPagesForCountry(defaultCountry);
        } else if (!cancelled) {
          setLoading(false);
        }
      } catch (error) {
        console.log("Failed to load passport size countries", error);
        if (!cancelled) setLoading(false);
      }
    };

    loadCountries();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = async (selectedOption: any) => {
    const value = selectedOption?.value;
    if (!value) return;
    await loadPagesForCountry(value);
  };

  const resetSelectField = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectRef?.current) {
      selectRef.current.clearValue();
    }
    setSelectedPages(null);
    setSelectedValue(null);
    setLoading(false);
  };

  return (
    <section className="page-width margin-bottom mt-5">
      <div className="formControll mb-3">
        <h2 className="headingSizeChart heading-h2 text-center mb-4">
          {section?.settings?.title}
        </h2>
        {section?.settings?.content && (
          <div
            className="rte mb-3"
            dangerouslySetInnerHTML={{
              __html: htmlDecode(section?.settings?.content),
            }}
          />
        )}
      </div>
      <div className="sizechart-filed-wrapper d-flex justify-content-center align-items-center text-center">
        <div className="formControll">
          <Select
            ref={selectRef}
            options={passportSizeCountries}
            value={
              selectedValue
                ? { value: selectedValue, label: selectedValue }
                : null
            }
            onChange={handleChange}
            placeholder="Please Select Your Country"
            className="selectOptionsCustom-chart"
            styles={selectStyles}
          />
          {selectedValue && (
            <button
              type="button"
              className="clear-action"
              onClick={resetSelectField}
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>
      <div className="d-block height-animate">
        {loading ? (
          <SectionLoader />
        ) : (
          selectedValue &&
          selectedPages && <SizeGrid content={selectedPages} />
        )}
      </div>
    </section>
  );
};

export default PhotoSizeChart;

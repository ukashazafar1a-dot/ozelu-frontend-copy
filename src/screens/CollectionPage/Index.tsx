"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import {
  useRouter,
  useParams,
  useSearchParams,
  usePathname,
} from "next/navigation";
import Banner from "./Banner";
import SectionLoader from "@/components/Loader/SectionLoader";
import "./Style.css";
import "@/components/EComereceStore/ProductCard.scss";
import FilterSidebar from "./FilterSidebar";
import ProductsGrid from "./ProductsGrid";
import {
  convertParamString,
  getFilterValues,
  sortings,
} from "@/helpers/CollectionHelper";
import FilterBtn from "./FilterBtn";
import GridBtns from "./GridBtns";
import SortOption from "./SortOption";
import CollectionFooter from "./CollectionFooter";
import CollectionLoader from "./CollectionLoader";

const Index = ({ data }: any) => {
  const paraSlug = useParams();
  const slug = paraSlug?.slug;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams() || {};
  const [selectedFilters, setSelectedFilters] = useState<any>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [collection, setCollection] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(1);
  const [page, setPage] = useState<any>(null);
  const [sort, setSort] = useState<any>(null);
  const [selectedFromURL, setSelectedFromURL] = useState<any>(null);
  const [smallLoader, setSmallLoader] = useState<any>(false);
  const [productsPerLineD, setProductsPerLineD] = useState(4);
  const [productsPerLineT, setProductsPerLineT] = useState(3);
  const [productsPerLineM, setProductsPerLineM] = useState(2);
  const [sbOpened, setSbOpened] = useState<any>(false);
  const [openbar, setOpenbar] = useState<any>(false);
  const [sortBy, setSortBy] = useState<any>(sortings[0]);

  function getSortByFromURL(): string | null {
    const queryParams = new URLSearchParams(searchParams?.toString());
    return queryParams.get("sort_by");
  }

  function setViewSizeD(e: any, size: any) {
    e.preventDefault();
    setProductsPerLineD(size);
  }

  function setViewSizeT(e: any, size: any) {
    e.preventDefault();
    setProductsPerLineT(size);
  }

  function setViewSizeM(e: any, size: any) {
    e.preventDefault();
    setProductsPerLineM(size);
  }

  const onSortByClick = useCallback(
    (e: any) => {
      e?.preventDefault();
      e?.stopPropagation();
      setSbOpened(!sbOpened);
    },
    [sbOpened]
  );

  function onChangeSortBy(e: any, size: any) {
    e?.preventDefault();
    e?.stopPropagation();
    setSortBy(size);
    changeSort(size?.value);
    setSbOpened(false);
  }

  const CloseSidebar = () => {
    if (window.innerWidth <= 768) {
      setOpenbar(!openbar);
    } else {
      //console.log('no time now');
      return;
    }
  };

  const filterValues = async (label: any, key: any, value: any) => {
    const updatedFilters = { ...selectedFilters };
    const newKey = `${key}:${label}`;
    updatedFilters[newKey] = value;
    return updatedFilters;
  };

  const updateSelectedFilters = async (label: any, key: any, value: any) => {
    const newValues = await filterValues(label, key, value);
    setSelectedFilters({ ...newValues });
    return newValues;
  };

  const handleChange = async (slug: any, filters: any) => {
    try {
      const newQueryParams = new URLSearchParams();
      for (const [key, value] of Object.entries<string>(filters)) {
        const id = key.split(":")[0];
        newQueryParams.append(`filter[${id}]`, value);
      }
      const newQuery = newQueryParams.toString();
      //console.log("Query", newQuery);
      await router.push(`/collections/${slug}?${newQuery}`, { scroll: false });
      return true;
    } catch (error) {
      console.error("Error navigating:", error);
      return false;
    }
  };

  const filterChange = async (
    e: any,
    label: any,
    id: any,
    value: any,
    isChecked: any
  ) => {
    e?.preventDefault();
    e?.stopPropagation();
    const newValue = await updateSelectedFilters(label, id, value);
    //console.log('new filters',newValue)
    setSmallLoader(true);
    await handleChange(slug, newValue);
  };

  const annoyFilter = async (label: any, id: any, value: any) => {
    const newValue = await updateSelectedFilters(label, id, value);
    //console.log('new filters',newValue)
    setSmallLoader(true);
    await handleChange(slug, newValue);
  };

  async function changePage(page: any) {
    if (page === currentPage) {
      return false;
    }
    setPage(page);
    setSmallLoader(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    const queryParams = new URLSearchParams(searchParams?.toString());
    const params: any = Object.fromEntries(queryParams.entries());
    if (params?.page === page) {
      // The page parameter is already set to the desired value
      return false;
    }
    // Update the page parameter
    params.page = page;
    // Update the URL with the new query parameters
    const newQuery = new URLSearchParams(params).toString();
    router.push(`/collections/${slug}?${newQuery}`, { scroll: true });
    return true;
  }

  function changeSort(value: any) {
    setSort(value);
    setSmallLoader(true);
    const queryParams = new URLSearchParams(searchParams?.toString());
    // Remove the existing sort_by parameter
    queryParams?.delete("sort_by");
    // Add or update the sort_by parameter
    if (value !== "recommended") {
      queryParams.set("sort_by", value);
    }
    queryParams.set("page", "1");
    //console.log(params)
    // Update the URL with the new query parameters
    const newQuery = queryParams.toString();
    router.push(`/collections/${slug}?${newQuery}`, { scroll: false });
    return true;
  }
  const clearFilters = () => {
    if (pathname) {
      setSmallLoader(true);
      setSelectedFilters({});
      router.push(pathname, { scroll: true });
    }
  };

  function checkParamsFilter() {
    const seachString = searchParams?.toString();
    const selected = seachString?.split("&");
    let object: any = {};
    if (selected.length > 0) {
      selected?.forEach((item: any) => {
        const newLine = convertParamString(item);
        //console.log(newLine)
        if (newLine?.value) {
          if (!object[newLine?.label]) {
            object[newLine?.label] = [];
          }
          if (!object[newLine?.label].includes(newLine?.value)) {
            object[newLine?.label].push(newLine?.value);
          }
        }
      });
    }
    //console.log(object)
    setSelectedFromURL(object);
  }

  useEffect(() => {
    const sortByFromURL = getSortByFromURL();
    if (sortByFromURL) {
      const foundSortOption = sortings.find(
        (option) => option.value === sortByFromURL
      );
      if (foundSortOption) {
        setSortBy(foundSortOption);
      }
    }
  }, []);

  useEffect(() => {
    if (data?.status) {
      //console.log("data changed", data);
      setCollection(data?.collection);
      setCurrentPage(data?.pagination?.currentPage);
      setTotalCount(data?.pagination?.count);
      setIsPageLoading(false);
      checkParamsFilter();
      setSmallLoader(false);
    }
  }, [data]);

  return (
    <>
      <div className="colleciton--template">
        <Banner title={collection?.title} />
        <Suspense fallback={<SectionLoader />}>
          <section className="mb__60 section--collection--template position-relative">
            <div className="filter--bar p-3">
              <div className="row align-items-center justify-content-center mx-0 filter--toolbar">
                <FilterBtn
                  CloseSidebar={CloseSidebar}
                  hide={
                    collection.filters && collection?.filters.length > 0
                      ? true
                      : false
                  }
                />
                <GridBtns
                  productsPerLineD={productsPerLineD}
                  productsPerLineM={productsPerLineM}
                  productsPerLineT={productsPerLineT}
                  setViewSizeD={setViewSizeD}
                  setViewSizeT={setViewSizeT}
                  setViewSizeM={setViewSizeM}
                />
                <SortOption
                  sortBy={sortBy}
                  sbOpened={sbOpened}
                  setSbOpened={setSbOpened}
                  onSortByClick={onSortByClick}
                  sortings={sortings}
                  onChangeSortBy={onChangeSortBy}
                  porductCount={totalCount}
                  searchedParams={selectedFilters}
                />
              </div>
            </div>
            <div
              className={`container-fluid products--grid ${
                smallLoader ? "collection-loading" : "no-loader"
              } `}
            >
              <div className="d-flex">
                {collection?.filters && collection?.filters.length > 0 && (
                  <FilterSidebar
                    open={openbar}
                    closeClick={CloseSidebar}
                    collection={collection}
                    filterChange={filterChange}
                    searchedParams={selectedFilters}
                    clearFilter={clearFilters}
                    autoCapture={selectedFromURL}
                    annoyFilter={annoyFilter}
                  />
                )}
                <ProductsGrid
                  products={collection?.products}
                  desktopPerLine={productsPerLineD}
                  mobilePerLine={productsPerLineM}
                  tabletPerLine={productsPerLineT}
                  loading={isPageLoading}
                />
              </div>
              {smallLoader && <CollectionLoader />}
            </div>
            <div className="container-fluid products--grid">
              <div className="d-flex">
                {totalCount && currentPage ? (
                  <CollectionFooter
                    changePage={changePage}
                    currentPage={currentPage}
                    totalCount={totalCount}
                  />
                ) : (
                  <></>
                )}
              </div>
            </div>
          </section>
        </Suspense>
      </div>
    </>
  );
};

export default Index;

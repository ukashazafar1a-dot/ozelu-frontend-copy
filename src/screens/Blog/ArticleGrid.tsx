"use client";
import React, { useEffect, useRef, useState } from "react";
import ArticleCard from "./ArticleCard";
import ReactSelect from "react-select";
import SectionLoader from "@/components/Loader/SectionLoader";
import returnPosts from "@/helpers/getPosts";
import _ from "lodash";

const ArticleGrid = ({ data }: any) => {
  const [articles, setArticles] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<any>({
    label: "All Posts",
    value: "All",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<any>(null);

  //console.log('options',options)
  const [value, setValue] = useState<any>(null);
  const handleChange = async (selectedOption: any) => {
    const selectedValue = selectedOption?.value;
    setSearchTerm('');
    if (options) {
      const selectedObjects = options?.filter(
        (item: any) => item?.value === selectedValue
      );
      //console.log(selectedObjects[0])
      setValue(selectedObjects[0]);
      setLoading(true);
      setTimeout(async () => {
        if (selectedObjects[0]?.value == "All") {
          setArticles(data);
        } else {
          const fitlered = await data?.filter(
            (article: any) =>
              article?.category?.slug == selectedObjects[0]?.value
          );
          //console.log('filtered',fitlered,articles,data);
          setArticles(fitlered);
        }
        setLoading(false);
      }, 1000);
    }
  };
  useEffect(() => {
    // initialize debounce function to search once user has stopped typing every half second
    if (inputRef) {
      inputRef.current = _.debounce(onSearchText, 300);
    }
  }, []);

  const onSearchText = async (value: any) => {
    if (value.length >= 2) {
      const result = await returnPosts(value);
      //console.log(result);
      setArticles(result?.blogs);
      setLoading(false);
    } else {
      //console.log('value is less then 3');
      setLoading(false);
    }
  };
  const handleSearch = async (event: any) => {
    setLoading(true);
    const input: any = event.target.value;
    const value: any = input.trim();
    setSearchTerm(input);
    inputRef?.current(input);
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  useEffect(() => {
    setArticles(data);
    async function getPosts() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/assets/blog/categories/all`,
          {
            next: {
              revalidate: 60,
            },
          }
        );
        if (!res.status) {
          throw new Error("Failed to fetch data");
          setLoading(false);
        }
        const result = await res.json();
        //console.log(result);
        var data: any = [
          {
            label: "All Posts",
            value: "All",
          },
        ];
        await result?.categories?.forEach((item: any) => {
          data.push({
            label: item?.title,
            value: item?.slug,
          });
        });
        setOptions(data);
        setValue(data[0]);
        setLoading(false);
      } catch (error: any) {
        setLoading(false);
        throw new Error("Failed to fetch data", error);
      }
    }
    getPosts();
  }, [data]);

  //console.log("options", options,value);
  return (
    <section className="main_content">
      <div className="d-block article-actions">
        <div className="d-flex justify-content-between align-items-center flex-column flex-md-row gap-2">
          <div className="col-md-3 p-0 m-0">
            <div className="catory-select-field">
              <ReactSelect
                options={options}
                defaultValue={options[0]?.value}
                onChange={handleChange}
                placeholder={options[0]?.label}
                className="custom--select-field"
                classNamePrefix="react-select"
                isSearchable={false}
                styles={{
                  control: (baseStyles: any, state: any) => ({
                    ...baseStyles,
                    borderColor: state.isFocused ? "black" : "black",
                    color: "black",
                  }),
                  option: (provided: any, state: any) => ({
                    ...provided,
                    backgroundColor: state.isSelected ? "#f7f7f7" : "white",
                    color: state.isSelected ? "#000000" : "#000000",
                    "&:hover": {
                      backgroundColor: "lightgray", // Change hover color if desired
                    },
                  }),
                }}
                theme={(theme: any) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary25: "#ffffff",
                    primary: "#121212",
                  },
                })}
              />
            </div>
          </div>
          <form
            className="form-inline col-md-4 p-0 m-0 flex-nowrap gap-2"
            onSubmit={(e) => handleSubmit(e)}
          >
            <div className="form-group mb-2 flex-grow-1">
              <label htmlFor="SearchFeildArticles" className="sr-only">
                Search
              </label>
              <input
                type="search"
                className="form-control w-100"
                id="SearchFeildArticles"
                value={searchTerm}
                onChange={(e: any) => handleSearch(e)}
                placeholder="Search posts, topics and authors..."
              />
            </div>
            <button type="submit" className="btn btn-info mb-2">
              <span className="sr-only">Search</span>
              {loading ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                <i className="fa fa-search"></i>
              )}
            </button>
          </form>
        </div>
      </div>
      <div className="article-grid row my-5 gap-3 mx-0">
        {loading ? (
          <SectionLoader />
        ) : (
          <>
            {articles && articles?.length > 0 ? (
              articles?.map((article: any, index: any) => {
                return (
                  <ArticleCard
                    article={article}
                    key={article?._id}
                    index={index}
                  />
                );
              })
            ) : (
              <p>No Post Available.</p>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default ArticleGrid;

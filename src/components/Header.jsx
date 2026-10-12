"use client";

import React, { useContext, useEffect } from "react";
import "./header.css";
import { useState } from "react";
import AppContext from "../store/AppContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NavMenu from "./NavMenu";
import { Site } from "@/libs/site";
import Image from "next/image";

const sidebarItems = [
  {
    text: "Passport Size Photos Delivery",
    link: "/passport-size-photos",
    isActive: false,
  },
  {
    text: "Photos and Documents Printing",
    isActive: false,
    subMenu: [
      {
        text: "Photo Printing & Delivery",
        link: "/photos-printing-delivery",
      },
      {
        text: "Document Printing",
        link: "/documents-printing",
      },
    ],
  },
  {
    text: "CV Templates",
    link: "/cv-templates",
    isActive: false,
  },

  {
    text: "Editing Services",
    isActive: false,
    subMenu: [
      {
        text: "Logo Designing",
        link: "/editing-service/logo-designing",
      },
      {
        text: "Photo Retouching",
        link: "/editing-service/photo-retouching",
      },
    ],
  },
  {
    text: "Photography Services",
    isActive: false,
    subMenu: [
      {
        text: "Portrait Headshots",
        link: "/photography-service/portrait-headshots",
      },
      {
        text: "Event Photography",
        link: "/photography-service/event-photography",
      },
      {
        text: "Wedding Photography",
        link: "/photography-service/wedding-photography",
      },
    ],
  },
  {
    text: "E-Commerece Store",
    isActive: false,
    subMenu: [
      {
        text: "All",
        link: "/collections/all",
      },
    ],
  },
];

////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////

function Header() {
  const pathname = usePathname();
  const { mainMenu } = useContext(AppContext);
  const [activeIndex, setActiveIndex] = useState(-1);
  function toggleSubmenu(index, innerIndex = 0) {
    setActiveIndex((prev) => {
      if (prev?.outer === index && prev?.inner === innerIndex) {
        // closeMenu();
        return -1;
      }
      return { outer: index, inner: innerIndex };
    });
    if (activeIndex?.outer === index && activeIndex?.inner === innerIndex) {
      setActiveIndex(null);
    } else {
      setActiveIndex({
        outer: index,
        inner: innerIndex,
      });
    }
    console.log("Active index>>", activeIndex);
  }

  const openMenu = () => {
    document.getElementById("overlay").style.display = "flex";
  };
  const closeMenu = () => {
    document.getElementById("overlay").style.display = "none";
  };

  // const handleMouseEnter = (e)=>{
  //   const elem = e.currentTarget;
  //   if(!elem.parentElement.classList.contains('show')){
  //     e.currentTarget.click()
  //   }
  // }

  const handleInnerMouseEnter = (e) => {
    const elem = e.currentTarget.querySelector(".dropdown-menu");
    if (!elem.classList.contains("show")) {
      elem.classList.add("show");
    }
  };

  const handleInnerMouseLeave = (e) => {
    const elem = e.currentTarget.querySelector(".dropdown-menu");
    if (elem.classList.contains("show")) {
      elem.classList.remove("show");
    }
  };

  function NewlineText(props) {
    const text = props.text;
    return (
      <>
        {text.split("*").map((str, i) => {
          if (i === 0) return str;
          return (
            <>
              <br />
              {str}
            </>
          );
        })}
      </>
    );
  }

  useEffect(() => {
    //console.log("main menu>>", mainMenu)
  }, [mainMenu]);

  if (!mainMenu) return null;

  return (
    <header className="header--wrapper" id="header">
      <div className="header px-lg-5 px-0">
        <nav className="navbar navbar-expand-xl navbar-light width-100 navbar-default navbar-static-top  px-lg-3 px-0">
          {/* <Link className="navbar-brand link" href="/">
            <h1 className="logo">Ozelu Studio</h1>
          </Link> */}
          <Link className="navbar-brand link" href="/">
            <Image
              src={Site?.logos?.withPrint}
              alt="Ozelu Official Logo"
              className="official-logo"
              loading="lazy"
              width={265}
              height={60}
            />
          </Link>
          <button className="navbar-toggler toggle-btn-inner" type="button">
            <span onClick={openMenu}>&#9776;</span>
          </button>
          {mainMenu && (
            <div
              className="collapse navbar-collapse flex-end"
              id="collapsibleNavbar"
            >
              <ul className="navbar-nav nav-link-typography">
                {mainMenu?.children.map((item, i) => {
                  return <NavMenu key={item?.title + i} item={item} />;
                })}
              </ul>
            </div>
          )}
        </nav>
      </div>
      <div id="overlay">
        <nav onClick={(event) => event.stopPropagation()}>
          <div className="top-div">Menu</div>
          <ul>
            {mainMenu?.children.map((item, index) => (
              <li key={item.title + index}>
                <Link
                  href={item?.url}
                  className={pathname === item.url ? "active link" : "link"}
                  onClick={closeMenu}
                >
                  {item.title.split("*").join(" ")}
                  <div
                    className="inner-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      toggleSubmenu(index);
                    }}
                  >
                    {item?.children && item?.children?.length ? (
                      activeIndex?.outer === index ? (
                        <span className="fas fa-minus"></span>
                      ) : (
                        <span className="fas fa-plus"></span>
                      )
                    ) : null}
                  </div>
                </Link>
                {item.children && item?.children?.length ? (
                  <ul
                    style={{
                      display: activeIndex?.outer === index ? "block" : "none",
                    }}
                  >
                    {item.children.map((subMenuItem, innerIndex) => (
                      <li key={subMenuItem.title + innerIndex}>
                        <Link
                          href={subMenuItem?.url}
                          onClick={() => {
                            if (subMenuItem.url) {
                              closeMenu();
                            }
                          }}
                          className={
                            pathname === subMenuItem.url
                              ? "active link"
                              : "link"
                          }
                        >
                          {subMenuItem.title}
                          <div
                            className="inner-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              if (
                                subMenuItem?.children &&
                                subMenuItem?.children?.length
                              ) {
                                toggleSubmenu(index, innerIndex);
                              }
                            }}
                          >
                            {subMenuItem?.children &&
                            subMenuItem?.children?.length ? (
                              activeIndex?.inner === innerIndex ? (
                                <span className="fas fa-minus"></span>
                              ) : (
                                <span className="fas fa-plus"></span>
                              )
                            ) : null}
                          </div>
                        </Link>
                        {subMenuItem.children &&
                        subMenuItem?.children?.length ? (
                          <ul
                            style={{
                              display:
                                activeIndex?.inner === innerIndex
                                  ? "block"
                                  : "none",
                            }}
                          >
                            {subMenuItem.children.map(
                              (subSubMenuItem, index) => (
                                <li key={subSubMenuItem.title + index}>
                                  <Link
                                    href={subSubMenuItem?.url}
                                    onClick={(e) => {
                                      if (subSubMenuItem.url) {
                                        closeMenu();
                                      }
                                    }}
                                    className={
                                      pathname === subSubMenuItem.url
                                        ? "active link"
                                        : "link"
                                    }
                                  >
                                    {subSubMenuItem.title}
                                  </Link>
                                </li>
                              )
                            )}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>
        <button className="closebtn" onClick={closeMenu}>
          <i className="fas fa-xmark" />
        </button>
      </div>
    </header>
  );
}

export default Header;

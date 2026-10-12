"use client";
import {
  NewlineText,
  handleInnerMouseEnter,
  handleInnerMouseLeave,
} from "@/helpers/generals";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import slugify from "slugify";

const NavMenu = ({ item }: any) => {
  const pathname = usePathname();
  return (
    <li className="nav-item">
      {item?.children && item?.children?.length ? (
        <div className="dropdown" data-menu={slugify(item?.title)}>
          <a
            className="nav-link link"
            id="dropdownMenuButton"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <NewlineText text={item?.title} />
          </a>
          <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            {item?.children?.map((childItem: any,index:any) => {
              return (
                <ul className="no-ul" key={ index}>
                  {childItem?.children && childItem?.children?.length ? (
                    <li
                      className="dropdown-submenu"
                      onMouseEnter={handleInnerMouseEnter}
                      onMouseLeave={handleInnerMouseLeave}
                    >
                      <Link
                        className="dropdown-item"
                        tabIndex={-1}
                        href={childItem?.url}
                      >
                        {childItem?.title} &raquo;
                      </Link>
                      <ul className="dropdown-menu">
                        {childItem?.children?.map((grandChildItem: any,index:any) => {
                          return (
                            <li key={index}>
                              <Link
                                className="dropdown-item"
                                tabIndex={-1}
                                href={grandChildItem?.url}
                              >
                                {grandChildItem?.title}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ) : (
                    <li>
                    <Link
                      className={`dropdown-item link ${
                        pathname === childItem?.url ? "active" : ""
                      }`}
                      href={childItem?.url}
                    >
                      {childItem?.title}
                    </Link>
                    </li>
                  )} 
                </ul>
              );
              return;
            })}
          </div>
        </div>
      ) : (
        <Link
          href={item?.url}
          className={`nav-link link ${pathname === item.url ? "active" : ""}`}
        >
          <NewlineText text={item?.title} />
        </Link>
      )}
    </li>
  );
};

export default NavMenu;

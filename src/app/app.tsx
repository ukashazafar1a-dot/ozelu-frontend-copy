"use client";
import React, { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "swiper/css";
import MiniCart from "@/components/EComereceStore/MiniCart";
import SiteLoader from "@/components/Loader/SiteLoader";
import "lazysizes";
import dynamic from "next/dynamic";



import useApp from "@/store/useApp";
import MaintenanceMode from "@/components/MaintenanceMode";
import AnnoucementBar from "@/components/AnnoucementBar";

export default function App({ children }: { children: React.ReactNode }) {
  const { isLoading, isError, generalSections }:any = useApp();
  if (isError) return <MaintenanceMode />;


  // Load lazysizes only on client
  const LazySizesLoader = dynamic(() => import('../components/LazySizesLoader'), {
    ssr: false
  });

  return (
    <div className="app">
      <LazySizesLoader/>
      {isLoading ? (
        <SiteLoader />
      ) : (
        <>
          {generalSections && generalSections['announcement-bar'] && <AnnoucementBar content={generalSections['announcement-bar']}/>}
          <Header />
          <MiniCart />
          <div className="page-transition">{children}</div>
          <Footer />
        </>
      )}
    </div>
  );
}

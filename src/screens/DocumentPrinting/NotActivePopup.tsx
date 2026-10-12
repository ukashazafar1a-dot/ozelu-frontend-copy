"use client";
import showCustomPopup from "@/components/NoSwal";
import React, { useState } from "react";

const NotActivePopup = ({ message }: any) => {
  return <>{showCustomPopup(message)}</>;
};
export default NotActivePopup;

import React from "react";
import { Metadata } from "next";
import Feedback from "@/screens/feedbackPage";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Feedback - Ozelu Studio",
  description: "Give Your Feedback for the Ozelu Studio",
  alternates: {
    canonical: '/feedback',
  }
};

const page = async () => {
  return <Feedback />;
};

export default page;

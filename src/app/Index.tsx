"use client";
import { AppProvider } from "../store/AppContext";
import { CartProvider } from "react-use-cart";
import App from "./app";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import "../css/tables.css";
import MicrosoftClarity from "@/hooks/MicrosoftClarity";
import CheckoutActivityBeacon from "@/components/CheckoutActivityBeacon";

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <main className="App">
      <CartProvider>
        <AppProvider>
          <CheckoutActivityBeacon />
          <App>{children}</App>
        </AppProvider>
      </CartProvider>
      <ProgressBar
        height="3px"
        color="#000000"
        options={{ showSpinner: false }}
        shallowRouting
      />
      <MicrosoftClarity />
    </main>
  );
}

export default Providers;

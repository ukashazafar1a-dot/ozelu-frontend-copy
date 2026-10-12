"use client";

import React, { createContext, useEffect, useReducer, useRef } from "react";
import axios from "axios";
import { getData } from "@/helpers/generals";
import {
  ensureActiveCheckoutSessionId,
  SESSION_CHANGED_EVENT,
} from "@/helpers/checkoutActivity";

const initialState = {
  sessionId: null,
  isLoading: true,
  isError: false,
  stripe: null,
  stripeElements: null,
  cardNumber: null,
  templates: [],
  areas: [],
  purposes: [],
  mainMenu: null,
  servicesMenu: null,
  policiesMenu: null,
  passportSizePrices: [],
  photoPrintingPrices: [],
  documentPrintingPrices: [],
  storePrices: [],
  canvasPrintingPrices: [],
  foamBoardPrintingPrices: [],
  stickersPrintingPrices: [],
  certificatesPrintingPrices: [],
  businessCardsPrintingPrices: [],
  flyersPrintingPrices: [],
  greetingCardsPrintingPrices: [],
  mugsPrintingPrices: [],
  tShirtsPrintingPrices: [],
  menuPrintingPrices: [],
  brochuresPrintingPrices: [],
  generalSections: [],
  cartIsOpened: false,
};

const APP_BOOTSTRAP_TIMEOUT_MS = 12000;
const APP_BOOTSTRAP_RETRIES = 2;

const normalizeMenuUrl = (value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:") ||
    trimmed.startsWith("#")
  ) {
    return trimmed;
  }

  const [pathWithSlash, hash = ""] = trimmed.split("#");
  const [pathOnly, query = ""] = pathWithSlash.split("?");
  const withLeadingSlash = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  const normalizedPath = withLeadingSlash
    .split("/")
    .map((segment) => segment.trim().replace(/\s+/g, "-"))
    .join("/")
    .replace(/\/{2,}/g, "/");

  return `${normalizedPath}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
};

const normalizeMenuTree = (items) => {
  if (!Array.isArray(items)) return items;
  return items
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      ...item,
      url: normalizeMenuUrl(item?.url),
      children: normalizeMenuTree(item?.children),
    }));
};

const normalizeMenuObject = (menu) => {
  if (!menu || typeof menu !== "object") return menu;
  return {
    ...menu,
    url: normalizeMenuUrl(menu?.url),
    children: normalizeMenuTree(menu?.children),
  };
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_SESSION_ID":
      return { ...state, sessionId: action.payload };
    case "SAVE_STRIPE":
      return { ...state, stripe: action.payload.stripe };
    case "SET_STRIPE_ELEMENTS":
      return { ...state, stripeElements: action.payload };
    case "SAVE_CARD_NUMBER":
      return { ...state, cardNumber: action.payload };
    case "SET_CART_OPENED":
      return { ...state, cartIsOpened: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, isError: action.payload };
    case "SET_ASSETS":
      let areas = action.payload?.assets?.areas;
      let purposes = [];
      if (action.payload?.assets?.purposes) {
        purposes = action.payload?.assets?.purposes.map((purpose) => {
          let value = purpose.title.split("-").pop();
          return { value, label: value };
        });
      }
      // Remove from localStorage
      if (window.localStorage.getItem("areas")) {
        window.localStorage.clear("areas");
      }

      if (
        window.sessionStorage.getItem("areas") != "undefined" &&
        JSON.parse(window.sessionStorage.getItem("areas"))
      ) {
        //console.log('json area',JSON.parse(window.sessionStorage.getItem('areas')))
        areas = JSON.parse(window.sessionStorage.getItem("areas"));
      } else {
        window.sessionStorage.setItem("areas", JSON.stringify(areas));
      }
      return {
        ...state,
        templates: action.payload?.assets?.templates,
        areas: areas,
        purposes: purposes,
        passportSizePrices: action.payload?.assets?.areasPassportSizes,
        photoPrintingPrices:
          action.payload?.assets?.areasPhotoPrintingDeliveries,
        documentPrintingPrices: action.payload?.assets?.areasDocumentsPrintings,
        storePrices: action.payload?.assets?.areasStores,
        canvasPrintingPrices: action.payload?.assets?.areasCanvasPrintings || [],
        foamBoardPrintingPrices:
          action.payload?.assets?.areasFoamBoardPrintings || [],
        stickersPrintingPrices:
          action.payload?.assets?.areasStickersPrintings || [],
        certificatesPrintingPrices:
          action.payload?.assets?.areasCertificatesPrintings || [],
        businessCardsPrintingPrices:
          action.payload?.assets?.areasBusinessCardsPrintings || [],
        flyersPrintingPrices: action.payload?.assets?.areasFlyersPrintings || [],
        greetingCardsPrintingPrices:
          action.payload?.assets?.areasGreetingCardsPrintings || [],
        mugsPrintingPrices: action.payload?.assets?.areasMugsPrintings || [],
        tShirtsPrintingPrices:
          action.payload?.assets?.areasTShirtsPrintings || [],
        menuPrintingPrices:
          action.payload?.assets?.areasMenuPrintings || [],
        brochuresPrintingPrices:
          action.payload?.assets?.areasBrochuresPrintings || [],
        mainMenu: normalizeMenuObject(action.payload?.assets?.mainMenu),
        servicesMenu: normalizeMenuObject(action.payload?.assets?.servicesMenu),
        policiesMenu: normalizeMenuObject(action.payload?.assets?.policiesMenu),
        generalSections: action.payload?.assets?.generalSections?.sections,
        isLoading: false,
      };
    default: {
      return { ...state };
    }
  }
};

const AppContext = createContext({
  ...initialState,
  setCardNumber: () => {},
  getAreaSet: (areaName) => {},
  tryCreateToken: () => Promise.resolve(),
  setCartOpened: (value) => {},
  setStripeelements: (elements) => {},
  resetStripeElements: () => {},
  // addStepOne: () => Promise.resolve(),
});

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const sessionIdRef = useRef(state.sessionId);
  sessionIdRef.current = state.sessionId;

  const setStripeelements = (elements) => {
    dispatch({
      type: "SET_STRIPE_ELEMENTS",
      payload: elements,
    });
  };

  const setCardNumber = (value) => {
    dispatch({
      type: "SAVE_CARD_NUMBER",
      payload: value,
    });
  };

  const setCartOpened = (value) => {
    dispatch({
      type: "SET_CART_OPENED",
      payload: value,
    });
  };

  const tryCreateToken = async function () {
    const { token, error } = await state.stripe.createToken(state.cardNumber);
    if (error) {
      document.getElementById("error-handler").innerHTML = error.message;
      return undefined;
    } else {
      document.getElementById("error-handler").innerHTML = "";
      // Send the token to your server.
      return token;
    }
  };

  const resetStripeElements = function () {
    if (state.stripeElements) {
      state.stripeElements?.cardNumberInstance?.clear();
      state.stripeElements?.cardExpiry?.clear();
      state.stripeElements?.cardCvc?.clear();
    }
  };

  const getAreaSet = function (areaName) {
    var set = 0;
    state.areas.find((obj) => {
      if (obj.name == areaName) {
        set = obj.areaset;
        return;
      }
    });

    return set;
  };

  const setSessionId = function () {
    const cookieValue = ensureActiveCheckoutSessionId(sessionIdRef.current);
    if (!cookieValue) return;
    if (sessionIdRef.current === cookieValue) return;
    sessionIdRef.current = cookieValue;
    dispatch({
      type: "SET_SESSION_ID",
      payload: cookieValue,
    });
  };

  useEffect(() => {
    setSessionId();

    const syncSession = () => {
      const next = ensureActiveCheckoutSessionId(sessionIdRef.current);
      if (!next || sessionIdRef.current === next) return;
      sessionIdRef.current = next;
      dispatch({
        type: "SET_SESSION_ID",
        payload: next,
      });
    };

    // Resume deep-link may bind a session after first paint.
    window.addEventListener(SESSION_CHANGED_EVENT, syncSession);

    return () => {
      window.removeEventListener(SESSION_CHANGED_EVENT, syncSession);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      try {
        let data;
        let lastError;
        for (let attempt = 1; attempt <= APP_BOOTSTRAP_RETRIES; attempt++) {
          try {
            const response = await axios.get(
              process.env.NEXT_PUBLIC_API_URL + "/api/assets",
              {
                timeout: APP_BOOTSTRAP_TIMEOUT_MS,
              }
            );
            data = response.data;
            break;
          } catch (error) {
            lastError = error;
            if (attempt < APP_BOOTSTRAP_RETRIES) {
              console.warn(
                `App bootstrap attempt ${attempt} failed, retrying...`,
                error?.message || error
              );
            }
          }
        }

        if (!data) throw lastError;
        dispatch({
          type: "SET_ASSETS",
          payload: { assets: data.assets },
        });
        // console.log("Assets",data)
        // const {data} = await axios.get("http://localhost:5000/api/collections/all");
        // dispatch({
        // type: "SET_COLLECTIONS",
        //  payload: {collections: data}})
        if (!window?.Stripe) return;
        let stripeInstance = window.Stripe(
          process.env.NEXT_PUBLIC_STRIPE_TEST_TOKEN
        );
        dispatch({
          type: "SAVE_STRIPE",
          payload: { stripe: stripeInstance },
        });
        // test here
        // const homepage = await getData('homepage');
        // console.log(homepage?.status, await homepage?.json());
      } catch (err) {
        console.log("Error", err);
        dispatch({
          type: "SET_LOADING",
          payload: false,
        });
        dispatch({
          type: "SET_ERROR",
          payload: true,
        });
      }
    })();
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        setCardNumber,
        tryCreateToken,
        setCartOpened,
        getAreaSet,
        setStripeelements,
        resetStripeElements,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;

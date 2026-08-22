import React from "react";

export const I18nContext = React.createContext(null);
export const dict = { en: {}, hi: {} };
export const i18n = { language: "en", t: (key) => key };
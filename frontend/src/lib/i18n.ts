import React from "react";
export type Lang = "en" | "hi";
export const I18nContext = React.createContext<any>(null);
export const dict: Record<string, any> = { en: {}, hi: {} };
export const i18n = { language: "en", t: (key: string) => key };

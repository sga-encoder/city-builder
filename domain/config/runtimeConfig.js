// domain/config/runtimeConfig.js
let cityConfig = null;

export const setCityConfig = (config) => {
  cityConfig = config ?? null;
};

export const getCityConfig = () => cityConfig;

export const getBuildSubtypeConfig = (type, subtype = "") => {
  return cityConfig?.builds?.[type]?.[subtype] || {};
};

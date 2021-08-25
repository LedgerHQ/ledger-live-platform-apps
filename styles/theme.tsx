export type ThemeType = typeof defaultTheme; // This is the type definition for my theme object.

export const defaultTheme = {
  colors: {
    background: "#ffffff",
    text: "#142533",
    primary: "#6490F1",
    contrast: "#ffffff",
    alert: "#ea2e49",
    warning: "#ff7701",
  },
};

declare module "styled-components" {
  interface DefaultTheme extends ThemeType {}
}

export default defaultTheme;

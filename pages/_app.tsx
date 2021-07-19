import React, { useMemo } from "react";
import { useRouter } from "next/router";
import { AppProps } from "next/app";
import Head from "next/head";

import { ThemeProvider } from "styled-components";

import defaultTheme from "../styles/theme";
import { GlobalStyle } from "../styles/GlobalStyle";

import "modern-normalize";

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const router = useRouter();

  const { backgroundColor, textColor } = router.query;

  const theme = useMemo(
    () => ({
      colors: {
        ...defaultTheme.colors,
        background:
          typeof backgroundColor === "string"
            ? backgroundColor
            : defaultTheme.colors.background,
        text:
          typeof textColor === "string" ? textColor : defaultTheme.colors.text,
      },
    }),
    [backgroundColor, textColor]
  );

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
        />
        <title>Ledger Platform Apps</title>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}

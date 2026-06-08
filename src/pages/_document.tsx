import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <link rel="icon" href="/assets/images/logo.webp" />
      <body className="m-0">
      {/* <Drawer /> */}
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

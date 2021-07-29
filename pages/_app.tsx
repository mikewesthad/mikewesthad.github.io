import type { AppProps } from "next/app";
import "../global-styles/index.scss";
import "@fontsource/raleway";
import SiteLayout from "components/site-layout";
import Meta from "components/meta";

export default function MyApp({ Component, pageProps, router }: AppProps) {
  const pageKey = router.route;
  return (
    <SiteLayout pageKey={pageKey}>
      <Meta />
      <Component {...pageProps} />
    </SiteLayout>
  );
}

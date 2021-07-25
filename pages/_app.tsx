import type { AppProps } from "next/app";
import "@fontsource/raleway";
import SiteLayout from "../components/site-layout";
import "../global-styles/index.scss";

export default function MyApp({ Component, pageProps, router }: AppProps) {
  const pageKey = router.route;
  return (
    <SiteLayout pageKey={pageKey}>
      <Component {...pageProps} />
    </SiteLayout>
  );
}

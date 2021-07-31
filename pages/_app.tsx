import type { AppProps } from "next/app";
import "../global-styles/index.scss";
import "@fontsource/raleway";
import SiteLayout from "components/site-layout";
import Meta from "components/meta";
import useFoucFix from "../utils/use-fouc-fix";

export default function MyApp({ Component, pageProps, router }: AppProps) {
  // "Fix" for CSS module styling being unloaded in transitions. Hopefully, this
  // can be removed when the bug in Next.js is fixed. Otherwise, switching to
  // styled JSX would fix it...
  useFoucFix();

  const pageKey = router.route;
  return (
    <SiteLayout pageKey={pageKey}>
      <Meta />
      <Component {...pageProps} />
    </SiteLayout>
  );
}

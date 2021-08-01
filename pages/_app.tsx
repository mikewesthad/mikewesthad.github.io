import type { AppProps } from "next/app";

// Import just the Raleway styles used for minimizing payload:
import "@fontsource/raleway/400.css";
import "@fontsource/raleway/400-italic.css";
import "@fontsource/raleway/700.css";
import "@fontsource/raleway/700-italic.css";

import "../global-styles/index.scss";
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

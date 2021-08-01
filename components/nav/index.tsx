import { useWindowWidth } from "@react-hook/window-size/throttled";
import { useState } from "react";
import { useEffect } from "react";
import DesktopNav from "./desktop-nav";
import MobileNav from "./mobile-nav";
import css from "./index.module.scss";
import Link from "components/link";
import SkipToMainLink from "components/skip-to-main-link";

function Nav() {
  const width = useWindowWidth({ initialWidth: undefined });

  const [isRendered, setIsRendered] = useState(false);
  useEffect(() => {
    setIsRendered(true);
  }, []);

  let navContents;
  if (isRendered) {
    if (width > 950) {
      navContents = <DesktopNav />;
    } else {
      navContents = <MobileNav />;
    }
  }

  return (
    <>
      <SkipToMainLink />
      <nav className={css.nav}>
        <Link href="/" className={`unstyled-link ${css.navLogo}`}>
          mikewesthad
        </Link>
        {navContents}
      </nav>
      <div className={css.divider} />
    </>
  );
}

export default Nav;

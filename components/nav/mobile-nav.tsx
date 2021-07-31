import cn from "classnames";
import { MouseEventHandler, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IoClose, IoMenu } from "react-icons/io5";
import { GitHubIconLink, LinkedInIconLink, YouTubeIconLink } from "components/social-links";
import NavLink from "./nav-link";
import IconButton from "./icon-button";
import css from "./index.module.scss";

const animStates = {
  open: { opacity: 1, translateX: 0 },
  closed: { opacity: 0, translateX: "100%" },
};

interface MobileNavProps {}

function MobileNav({}: MobileNavProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const open = () => setIsCollapsed(false);
  const close = () => setIsCollapsed(true);

  // We need to close the nav when a link from the menu is selected.
  const onClick: MouseEventHandler<HTMLElement> = (e) => {
    const elem = e.target as HTMLElement;
    if (elem.tagName === "A") {
      close();
    }
  };

  return (
    <>
      <IconButton onClick={open}>
        <IoMenu />
      </IconButton>
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.ul
            className={cn(css.navList, css.mobileNavList)}
            key="mobileNav"
            initial="closed"
            animate="open"
            exit="closed"
            variants={animStates}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            onClick={onClick}
          >
            <IconButton onClick={close}>
              <IoClose />
            </IconButton>
            <NavLink href="/" exact={true} tiltLeft={true}>
              Home
            </NavLink>
            <li>
              <NavLink href="/portfolio/dev" tiltLeft={false}>
                Dev Portfolio
              </NavLink>
            </li>
            <li>
              <NavLink href="/portfolio/edu" tiltLeft={true}>
                Edu Portfolio
              </NavLink>
            </li>
            <li>
              <NavLink href="/portfolio/art" tiltLeft={false}>
                Art Portfolio
              </NavLink>
            </li>
            <li>
              <NavLink href="/blog" tiltLeft={true}>
                Blog
              </NavLink>
            </li>
            <li>
              <NavLink href="/contact" tiltLeft={false}>
                Contact
              </NavLink>
            </li>
            <li>
              <ul className={css.socialLinks}>
                <li>
                  <GitHubIconLink />
                </li>
                <li>
                  <LinkedInIconLink />
                </li>
                <li>
                  <YouTubeIconLink />
                </li>
              </ul>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </>
  );
}

export default MobileNav;
export type { MobileNavProps };

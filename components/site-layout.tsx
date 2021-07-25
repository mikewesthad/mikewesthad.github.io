import React from "react";
import Nav from "./nav";
import Footer from "./footer";
import css from "./site-layout.module.scss";
import { AnimatePresence, motion } from "framer-motion";

type SiteLayoutProps = {
  pageKey: string;
  children: React.ReactNode;
};

const scrollToTopLeft = () => window.scrollTo(0, 0);

function SiteLayout({ pageKey, children }: SiteLayoutProps) {
  return (
    <div className={css.layout}>
      <Nav />
      <AnimatePresence exitBeforeEnter initial={false} onExitComplete={scrollToTopLeft}>
        <motion.div
          key={pageKey}
          className={css.layoutContents}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

export default SiteLayout;
export type { SiteLayoutProps };

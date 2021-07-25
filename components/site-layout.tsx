import React from "react";
import Nav from "./nav";
import Footer from "./footer";
import css from "./site-layout.module.scss";
import { AnimatePresence, motion } from "framer-motion";

type LayoutProps = {
  pageKey: string;
  children: React.ReactNode;
};

function Layout({ pageKey, children }: LayoutProps) {
  return (
    <div className={css.layout}>
      <Nav />
      <AnimatePresence exitBeforeEnter initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
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

export default Layout;
export type { LayoutProps };

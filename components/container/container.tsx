import React from "react";
import css from "./container.module.scss";

interface ContainerProps {
  children: React.ReactNode;
}

function Container({ children }: ContainerProps) {
  return <div className={css.container}>{children}</div>;
}

export default Container;

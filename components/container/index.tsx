import cn from "classnames";
import css from "./index.module.scss";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  tagName?: keyof JSX.IntrinsicElements;
}

function Container({ children, className, tagName }: ContainerProps) {
  const Tag = tagName ?? "div";
  return <Tag className={cn(css.container, className)}>{children}</Tag>;
}

export default Container;

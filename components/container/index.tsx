import cn from "classnames";
import css from "./index.module.scss";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  tagName?: keyof JSX.IntrinsicElements;
  fullWidth?: boolean;
}

function Container({ children, className, fullWidth, tagName }: ContainerProps) {
  const Tag = tagName ?? "div";
  return <Tag className={cn(css.container, fullWidth && css.fullWidth, className)}>{children}</Tag>;
}

export default Container;

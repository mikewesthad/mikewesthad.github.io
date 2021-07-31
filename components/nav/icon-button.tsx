import cn from "classnames";
import css from "./icon-button.module.scss";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

function IconButton({ children, className, ...props }: IconButtonProps) {
  return (
    <button className={cn(css.button, className)} {...props}>
      {children}
    </button>
  );
}

export default IconButton;
export type { IconButtonProps };

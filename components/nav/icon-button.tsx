import cn from "classnames";
import css from "./icon-button.module.scss";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  ariaLabel: string;
}

function IconButton({ children, className, ariaLabel, ...props }: IconButtonProps) {
  return (
    <button aria-label={ariaLabel} className={cn(css.button, className)} {...props}>
      {children}
    </button>
  );
}

export default IconButton;
export type { IconButtonProps };

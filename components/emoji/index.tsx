import cn from "classnames";
import css from "./index.module.scss";

interface EmojiProps extends React.HTMLProps<HTMLSpanElement> {
  children: string;
  ariaLabel: string;
}

function Emoji({ children, className, ariaLabel }: EmojiProps) {
  return (
    <span role="img" aria-label={ariaLabel} className={cn(css.emoji, className)}>
      {children}
    </span>
  );
}

export default Emoji;
export type { EmojiProps };

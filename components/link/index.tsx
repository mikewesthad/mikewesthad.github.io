import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { IoOpenOutline } from "react-icons/io5";
import css from "./index.module.scss";

interface LinkProps extends NextLinkProps {
  children: React.ReactNode;
  className?: string;
  anchorProps?: React.HTMLProps<HTMLAnchorElement>;
  showExternalIcon?: boolean;
}

function Link({
  anchorProps,
  className,
  href,
  showExternalIcon = true,
  children,
  ...otherProps
}: LinkProps) {
  if (typeof href === "string" && href.startsWith("http")) {
    return (
      <a href={href} className={className} {...anchorProps}>
        {children}
        {showExternalIcon && <IoOpenOutline className={css.externalLinkSvg} />}
      </a>
    );
  }

  return (
    <NextLink scroll={false} href={href} {...otherProps}>
      <a className={className} {...anchorProps}>
        {children}
      </a>
    </NextLink>
  );
}

export default Link;
export type { LinkProps };

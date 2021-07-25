import React from "react";
import NextLink, { LinkProps as NextLinkProps } from "next/link";

interface LinkProps extends NextLinkProps {
  children: React.ReactNode;
  className?: string;
  anchorProps?: React.HTMLProps<HTMLAnchorElement>;
}

function Link({ anchorProps, className, children, ...otherProps }: LinkProps) {
  return (
    <NextLink scroll={false} {...otherProps}>
      <a className={className} {...anchorProps}>
        {children}
      </a>
    </NextLink>
  );
}

export default Link;
export type { LinkProps };

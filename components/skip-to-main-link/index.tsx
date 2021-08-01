import Link from "components/link";
import css from "./index.module.scss";

interface SkipToMainLinkProps {}

function SkipToMainLink({}: SkipToMainLinkProps) {
  return (
    <Link className={css.skip} href="#main-content">
      Skip to content
    </Link>
  );
}

export default SkipToMainLink;
export type { SkipToMainLinkProps };

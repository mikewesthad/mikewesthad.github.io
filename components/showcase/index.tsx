import Image from "next/image";
import Link from "components/link";
import css from "./index.module.scss";

interface ShowcaseItemProps {
  title: string;
  subtitle: string;
  image: StaticImageData;
  href: string;
}

function ShowcaseItem({ image, title, subtitle, href }: ShowcaseItemProps) {
  return (
    <li>
      <Link className="unstyled-link" href={href}>
        <figure className={css.showcaseItem}>
          <Image src={image} width={250} height={(250 * 9) / 16} objectFit="cover" />
          <figcaption>
            <div className={css.showcaseItemTitle}>{title}</div>
            <div className={css.showcaseItemSubtitle}>{subtitle}</div>
          </figcaption>
        </figure>
      </Link>
    </li>
  );
}

interface ShowcaseProps {
  children: React.ReactNode;
}

function Showcase({ children }: ShowcaseProps) {
  return <ul className={css.showcase}>{children}</ul>;
}

export default Showcase;
export { ShowcaseItem };
export type { ShowcaseItemProps, ShowcaseProps };

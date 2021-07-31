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
  const isExternalLink = href.startsWith("http://") || href.startsWith("https://");
  return (
    <li className={css.item}>
      <Link className="unstyled-link" href={href}>
        <figure className={css.figure}>
          <Image src={image} layout="fill" objectFit="cover" placeholder="blur" />
          <figcaption className={css.itemCaption}>
            <div className={css.itemTitle}>{title}</div>
            <div className={css.itemSubtitle}>{subtitle}</div>
          </figcaption>
        </figure>
      </Link>
      {isExternalLink && <div className={css.itemWarning}>(External link)</div>}
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

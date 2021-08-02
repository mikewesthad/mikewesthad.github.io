import Link from "components/link";
import Image from "next/image";
import css from "./post.module.scss";

interface PostProps {
  imageSrc: StaticImageData;
  title: string;
  description: string;
  href: string;
}

function Post({ imageSrc, title, description, href }: PostProps) {
  return (
    <li className={css.post}>
      <Link showExternalIcon={false} href={href} className={css.imageLink}>
        <Image src={imageSrc} alt={`Preview of ${title}`} objectFit="cover" placeholder="blur" />
      </Link>
      <div className={css.details}>
        <h2 className="text--md">{title}</h2>
        <p>{description}</p>
        <Link href={href}>Read on Medium</Link>
      </div>
    </li>
  );
}

export default Post;
export type { PostProps };

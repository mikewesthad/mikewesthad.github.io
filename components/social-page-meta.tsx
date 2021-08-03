import Head from "next/head";
import getConfig from "next/config";

const siteUrl = getConfig().publicRuntimeConfig.siteUrl;

interface SocialPageMetaProps {
  title: string;
  description: string;
  path: string;
  image?: string | StaticImageData;
}

function SocialPageMeta({ title, description, image, path }: SocialPageMetaProps) {
  let absoluteImageUrl;
  if (image) {
    if (typeof image === "string") {
      absoluteImageUrl = image;
    } else {
      absoluteImageUrl = `${siteUrl}${image.src}`;
    }
  }

  const url = `${siteUrl}${path}`;

  return (
    <Head>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {absoluteImageUrl && <meta property="og:image" content={absoluteImageUrl} />}
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="mikewesthad" />
    </Head>
  );
}

export default SocialPageMeta;
export type { SocialPageMetaProps };

import { graphql } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import * as React from "react";
import Layout from "../../components/layout";
import ImageGallery, { ReactImageGalleryItem } from "react-image-gallery";
import LeftSvg from "./chevron-left-solid.inline.svg";
import RightSvg from "./chevron-right-solid.inline.svg";
import "./style.css";

// const Gallery = (images) => {
//   return <div>{images[0]}</div>;
// };
const images = [
  {
    original: "https://picsum.photos/id/1018/1000/600/",
    thumbnail: "https://picsum.photos/id/1018/250/150/",
  },
  {
    original: "https://picsum.photos/id/1015/1000/600/",
    thumbnail: "https://picsum.photos/id/1015/250/150/",
  },
  {
    original: "https://picsum.photos/id/1019/1000/600/",
    thumbnail: "https://picsum.photos/id/1019/250/150/",
  },
];

interface ImageGalleryItem extends Partial<ReactImageGalleryItem> {
  data: any;
}

/**
 * Rebuild gallery:
 *  - Fullscreen
 *  - Mobile swipe
 *  - View full res
 *  - Optional captions
 * Work Page:
 *  - Header
 *  - Titled section
 * Build YT components
 * Add new projects
 * Verify HTML is solid
 * Check lighthouse score
 * Check accessibility
 */

const GalleryPage = ({ data }: any) => {
  const image = getImage(data.image2.childImageSharp)!;
  console.log(data);

  const gatsbyImages: ImageGalleryItem[] = [
    { data: data.image1.childImageSharp },
    { data: data.image2.childImageSharp },
    { data: data.image3.childImageSharp },
  ];

  return (
    <Layout pageTitle="Gallery">
      <h1>Gallery Test</h1>
      {/* <ImageGallery items={images} /> */}
      {/* <GatsbyImage image={image} alt="" /> */}
      <ImageGallery
        items={gatsbyImages as ReactImageGalleryItem[]}
        thumbnailPosition="bottom"
        showPlayButton={false}
        renderItem={(item) => {
          const data = (item as ImageGalleryItem).data;
          const image = getImage(data)!;
          return (
            <div style={{ height: "600px" }}>
              <GatsbyImage image={image} alt="" objectFit="contain" />
            </div>
          );
        }}
        renderThumbInner={(item) => {
          const data = (item as ImageGalleryItem).data;
          const image = getImage(data)!;
          return <GatsbyImage image={image} alt="" />;
        }}
      />
    </Layout>
  );
};

export default GalleryPage;

export const query = graphql`
  query {
    image1: file(relativePath: { eq: "meshes-screenshot-large.jpg" }) {
      childImageSharp {
        gatsbyImageData
      }
    }
    image2: file(relativePath: { eq: "rotating-large.jpg" }) {
      childImageSharp {
        gatsbyImageData
      }
    }
    image3: file(relativePath: { eq: "tangents-large.jpg" }) {
      childImageSharp {
        gatsbyImageData
      }
    }
    image4: file(relativePath: { eq: "projects/bound-lines.png" }) {
      childImageSharp {
        gatsbyImageData
      }
    }
  }
`;

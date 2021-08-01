import Document, { Html, Head, Main, NextScript } from "next/document";

/**
 * Custom Document to apply lang attribute to HTML.
 * See docs if more config is needed:
 *  https://nextjs.org/docs/advanced-features/custom-document
 */
class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

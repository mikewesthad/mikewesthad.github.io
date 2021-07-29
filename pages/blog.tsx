import Blog from "components/blog";
import Container from "components/container";
import PageTitle from "components/page-title";

interface BlogPageProps {}

function BlogPage({}: BlogPageProps) {
  return (
    <Container tagName="main">
      <PageTitle>Blog</PageTitle>
      <Blog />
    </Container>
  );
}

export default BlogPage;
export type { BlogPageProps };

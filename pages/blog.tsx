import Blog from "components/blog";
import Main from "components/main";
import PageDescription from "components/page-description";
import PageTitle from "components/page-title";

interface BlogPageProps {}

function BlogPage({}: BlogPageProps) {
  return (
    <Main>
      <PageTitle>Blog</PageTitle>
      <PageDescription>Michael Hadley&apos;s personal coding blog.</PageDescription>
      <Blog />
    </Main>
  );
}

export default BlogPage;
export type { BlogPageProps };

interface MainProps {
  children: React.ReactNode;
}

function Main({ children }: MainProps) {
  return <main id="main-content">{children}</main>;
}

export default Main;
export type { MainProps };

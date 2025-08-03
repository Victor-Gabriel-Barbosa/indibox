import { Header, Footer } from '@/components';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      {children}
      <Footer />
    </main>
  );
}

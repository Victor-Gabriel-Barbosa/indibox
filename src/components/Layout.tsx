import { Header, Footer } from '@/components';

// Propriedades do layout
interface LayoutProps {
  children: React.ReactNode;
}

// Componente de layout
export default function Layout({ children }: LayoutProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      {children}
      <Footer />
    </main>
  );
}
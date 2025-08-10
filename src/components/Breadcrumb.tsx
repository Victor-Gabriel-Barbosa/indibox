import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components';

// Tipos de itens do Breadcrumb
export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

// Propriedades do Breadcrumb
export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

// Componente de Breadcrumb (Migalhas de Pão)
const Breadcrumb = ({ items, className = '' }: BreadcrumbProps) => {
  return (
    <nav className={`mb-8 ${className}`}>
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item.href && !item.isActive ? (
              <Link href={item.href} className="hover:text-indigo-600 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={item.isActive ? 'text-foreground font-medium' : ''}>
                {item.label}
              </span>
            )}
            {index < items.length - 1 && (
              <Icons.BsChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumb;
import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function PageContainer({ children, title, subtitle }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {(title || subtitle) && (
          <div className="mb-6 sm:mb-8">
            {title && (
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm sm:text-base text-gray-600 font-medium">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

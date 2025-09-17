import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  backLink?: string;
}

export default function PlaceholderPage({ 
  title, 
  description = "This feature is currently under development and will be available soon.", 
  backLink = "/dashboard" 
}: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Construction className="w-8 h-8 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {title}
        </h1>
        
        <p className="text-gray-600 mb-8">
          {description}
        </p>
        
        <Link href={backLink} className="inline-flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </Link>
      </div>
    </div>
  );
}
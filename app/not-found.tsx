import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-gray-300 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-3">
          <Button asChild className="w-full bg-green-700 hover:bg-green-800">
            <Link href="/ideas">
              <Home className="w-4 h-4 mr-2" />
              Go to Ideas Portal
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="javascript:history.back()">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

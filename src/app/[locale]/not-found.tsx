import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
          <p className="text-gray-600 text-lg">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/dashboard">
              <Home className="h-5 w-5" />
              Go to Dashboard
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/market">
              <Search className="h-5 w-5" />
              Browse Marketplace
            </Link>
          </Button>
        </div>

        <div className="mt-12 p-6 bg-white/50 backdrop-blur rounded-lg border">
          <h3 className="font-semibold mb-3">Quick Links</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Link href="/market" className="text-primary hover:underline">Marketplace</Link>
            <Link href="/learning" className="text-primary hover:underline">Learning Hub</Link>
            <Link href="/ai-advisor" className="text-primary hover:underline">AI Advisor</Link>
            <Link href="/cooperative-planner" className="text-primary hover:underline">Planner</Link>
            <Link href="/storage-facilities" className="text-primary hover:underline">Storage</Link>
            <Link href="/transportation" className="text-primary hover:underline">Transport</Link>
            <Link href="/profile" className="text-primary hover:underline">Profile</Link>
            <Link href="/login" className="text-primary hover:underline">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

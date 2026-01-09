'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Database,
  Zap,
  Globe,
  ShoppingCart,
  Truck,
  Warehouse,
  GraduationCap,
  Wrench,
  DollarSign
} from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'pending';
  message: string;
  duration?: number;
}

interface PageTest {
  page: string;
  url: string;
  icon: any;
  tests: TestResult[];
}

export default function RealtimeTestPage() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<PageTest[]>([]);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'testing' | 'complete'>('idle');

  const testEndpoint = async (url: string, method: string = 'GET', body?: any): Promise<{ success: boolean; duration: number; data?: any }> => {
    const start = Date.now();
    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (body) {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(url, options);
      const data = await response.json();
      const duration = Date.now() - start;
      
      return {
        success: response.ok,
        duration,
        data,
      };
    } catch (error) {
      return {
        success: false,
        duration: Date.now() - start,
      };
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setOverallStatus('testing');
    const testResults: PageTest[] = [];

    // Test 1: Marketplace & Products
    const marketplaceTests: TestResult[] = [];
    
    // Test products API
    const productsTest = await testEndpoint('/api/products');
    marketplaceTests.push({
      name: 'Products API',
      status: productsTest.success ? 'pass' : 'fail',
      message: productsTest.success ? `Loaded ${productsTest.data?.length || 0} products` : 'Failed to load products',
      duration: productsTest.duration,
    });

    // Test real-time product data
    const productDetailTest = await testEndpoint('/api/products?id=1');
    marketplaceTests.push({
      name: 'Product Details',
      status: productDetailTest.success ? 'pass' : 'fail',
      message: productDetailTest.success ? 'Product details loaded' : 'Failed to load product details',
      duration: productDetailTest.duration,
    });

    testResults.push({
      page: 'Marketplace',
      url: '/market',
      icon: ShoppingCart,
      tests: marketplaceTests,
    });

    // Test 2: Transportation
    const transportTests: TestResult[] = [];
    
    const transportTest = await testEndpoint('/api/transportation?userId=1');
    transportTests.push({
      name: 'Transportation API',
      status: transportTest.success ? 'pass' : 'fail',
      message: transportTest.success ? 'Transportation data loaded' : 'Failed to load transportation',
      duration: transportTest.duration,
    });

    testResults.push({
      page: 'Transportation',
      url: '/transportation',
      icon: Truck,
      tests: transportTests,
    });

    // Test 3: Storage Facilities
    const storageTests: TestResult[] = [];
    
    const storageTest = await testEndpoint('/api/storage');
    storageTests.push({
      name: 'Storage Facilities API',
      status: storageTest.success ? 'pass' : 'fail',
      message: storageTest.success ? `Loaded ${storageTest.data?.length || 0} facilities` : 'Failed to load facilities',
      duration: storageTest.duration,
    });

    const bookingsTest = await testEndpoint('/api/storage/bookings?userId=1');
    storageTests.push({
      name: 'Storage Bookings',
      status: bookingsTest.success ? 'pass' : 'fail',
      message: bookingsTest.success ? 'Bookings loaded' : 'Failed to load bookings',
      duration: bookingsTest.duration,
    });

    testResults.push({
      page: 'Storage Facilities',
      url: '/storage-facilities',
      icon: Warehouse,
      tests: storageTests,
    });

    // Test 4: Learning Platform
    const learningTests: TestResult[] = [];
    
    const learningTest = await testEndpoint('/api/learning');
    learningTests.push({
      name: 'Learning Modules API',
      status: learningTest.success ? 'pass' : 'fail',
      message: learningTest.success ? 'Learning modules loaded' : 'Failed to load modules',
      duration: learningTest.duration,
    });

    testResults.push({
      page: 'Learning Platform',
      url: '/learning',
      icon: GraduationCap,
      tests: learningTests,
    });

    // Test 5: Payment System
    const paymentTests: TestResult[] = [];
    
    const paymentsTest = await testEndpoint('/api/payments?userId=1');
    paymentTests.push({
      name: 'Payment History API',
      status: paymentsTest.success ? 'pass' : 'fail',
      message: paymentsTest.success ? 'Payment history loaded' : 'Failed to load payments',
      duration: paymentsTest.duration,
    });

    // Test escrow stats
    const escrowTest = await testEndpoint('/api/escrow/stats');
    paymentTests.push({
      name: 'Escrow System',
      status: escrowTest.success ? 'pass' : 'fail',
      message: escrowTest.success ? `Active escrows: ${escrowTest.data?.stats?.activeEscrows || 0}` : 'Failed to load escrow stats',
      duration: escrowTest.duration,
    });

    testResults.push({
      page: 'Payment & Escrow',
      url: '/transactions',
      icon: DollarSign,
      tests: paymentTests,
    });

    // Test 6: Orders
    const orderTests: TestResult[] = [];
    
    const ordersTest = await testEndpoint('/api/orders?userId=1');
    orderTests.push({
      name: 'Orders API',
      status: ordersTest.success ? 'pass' : 'fail',
      message: ordersTest.success ? 'Orders loaded' : 'Failed to load orders',
      duration: ordersTest.duration,
    });

    testResults.push({
      page: 'Orders',
      url: '/orders',
      icon: ShoppingCart,
      tests: orderTests,
    });

    // Test 7: Weather Integration
    const weatherTests: TestResult[] = [];
    
    const weatherTest = await testEndpoint('/api/weather?location=Addis Ababa');
    weatherTests.push({
      name: 'Weather API',
      status: weatherTest.success ? 'pass' : 'fail',
      message: weatherTest.success ? 'Weather data loaded' : 'Failed to load weather',
      duration: weatherTest.duration,
    });

    testResults.push({
      page: 'Weather',
      url: '/weather',
      icon: Globe,
      tests: weatherTests,
    });

    // Test 8: IoT Devices
    const iotTests: TestResult[] = [];
    
    const iotTest = await testEndpoint('/api/iot-devices?userId=1');
    iotTests.push({
      name: 'IoT Devices API',
      status: iotTest.success ? 'pass' : 'fail',
      message: iotTest.success ? 'IoT devices loaded' : 'Failed to load devices',
      duration: iotTest.duration,
    });

    testResults.push({
      page: 'IoT Devices',
      url: '/iot-devices',
      icon: Zap,
      tests: iotTests,
    });

    // Test 9: Dashboard Data
    const dashboardTests: TestResult[] = [];
    
    const dashboardTest = await testEndpoint('/api/dashboard?userId=1&role=farmer');
    dashboardTests.push({
      name: 'Dashboard API',
      status: dashboardTest.success ? 'pass' : 'fail',
      message: dashboardTest.success ? 'Dashboard data loaded' : 'Failed to load dashboard',
      duration: dashboardTest.duration,
    });

    testResults.push({
      page: 'Dashboard',
      url: '/dashboard',
      icon: Database,
      tests: dashboardTests,
    });

    setResults(testResults);
    setOverallStatus('complete');
    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pass: { variant: 'default', className: 'bg-green-100 text-green-800' },
      fail: { variant: 'destructive', className: '' },
      pending: { variant: 'secondary', className: '' },
    };

    const config = variants[status] || variants.pending;

    return (
      <Badge variant={config.variant} className={config.className}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const calculateStats = () => {
    const allTests = results.flatMap(r => r.tests);
    const passed = allTests.filter(t => t.status === 'pass').length;
    const failed = allTests.filter(t => t.status === 'fail').length;
    const total = allTests.length;
    const avgDuration = allTests.reduce((sum, t) => sum + (t.duration || 0), 0) / total;

    return { passed, failed, total, avgDuration };
  };

  const stats = results.length > 0 ? calculateStats() : null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-blue-600" />
            Real-Time Functionality Test
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive testing of all pages, APIs, and integrations
          </p>
        </div>
        <Button 
          onClick={runAllTests} 
          disabled={testing}
          size="lg"
        >
          {testing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Run All Tests
            </>
          )}
        </Button>
      </div>

      {overallStatus === 'idle' && (
        <Alert>
          <AlertDescription>
            Click "Run All Tests" to check real-time functionality across all pages and integrations.
          </AlertDescription>
        </Alert>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Passed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600" />
                Total Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                Avg Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgDuration.toFixed(0)}ms</div>
            </CardContent>
          </Card>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((pageTest, index) => {
            const Icon = pageTest.icon;
            const passedTests = pageTest.tests.filter(t => t.status === 'pass').length;
            const totalTests = pageTest.tests.length;
            const allPassed = passedTests === totalTests;

            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {pageTest.page}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {passedTests}/{totalTests} passed
                      </span>
                      {getStatusBadge(allPassed ? 'pass' : 'fail')}
                    </div>
                  </div>
                  <CardDescription>
                    <a href={pageTest.url} className="text-blue-600 hover:underline">
                      {pageTest.url}
                    </a>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pageTest.tests.map((test, testIndex) => (
                      <div
                        key={testIndex}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(test.status)}
                          <div>
                            <div className="font-medium">{test.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {test.message}
                            </div>
                          </div>
                        </div>
                        {test.duration && (
                          <Badge variant="outline">{test.duration}ms</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {overallStatus === 'complete' && stats && (
        <Alert variant={stats.failed === 0 ? 'default' : 'destructive'}>
          <AlertDescription>
            {stats.failed === 0 ? (
              <>✅ All tests passed! All pages and integrations are working correctly.</>
            ) : (
              <>⚠️ {stats.failed} test(s) failed. Please check the failed tests above.</>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

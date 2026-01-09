'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Filter, 
  Users, 
  Package, 
  Clock,
  TrendingUp,
  Plus,
  RefreshCw,
  Info
} from 'lucide-react';
import { GroupPurchaseCard } from '@/components/group-purchase/group-purchase-card';
import { CreateGroupPurchase } from '@/components/group-purchase/create-group-purchase';
import { JoinGroupDialog } from '@/components/group-purchase/join-group-dialog';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

interface GroupPurchase {
  id: number;
  title: string;
  description: string;
  product_name: string;
  product_category: string;
  product_image?: string;
  organizer_name: string;
  organizer_verification: string;
  unit_price: number;
  group_discount_percentage: number;
  total_quantity: number;
  min_quantity_per_buyer: number;
  max_quantity_per_buyer?: number;
  target_participants: number;
  current_participants: number;
  remaining_slots: number;
  remaining_quantity: number;
  deadline: string;
  delivery_location?: string;
  status: string;
  created_at: string;
  my_quantity?: number;
  my_amount?: number;
  my_payment_status?: string;
  joined_at?: string;
}

export default function GroupPurchasesPage() {
  const t = useTranslations();
  const { user } = useApp();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('available');
  const [groupPurchases, setGroupPurchases] = useState<GroupPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupForJoin, setSelectedGroupForJoin] = useState<number | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Stats
  const [stats, setStats] = useState({
    totalAvailable: 0,
    myGroups: 0,
    myOrganized: 0,
    totalSavings: 0
  });

  useEffect(() => {
    fetchGroupPurchases();
  }, [activeTab, categoryFilter, locationFilter, maxPriceFilter, statusFilter]);

  const fetchGroupPurchases = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('type', activeTab);
      
      if (categoryFilter) params.append('category', categoryFilter);
      if (locationFilter) params.append('location', locationFilter);
      if (maxPriceFilter) params.append('maxPrice', maxPriceFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/group-purchases?${params}`);
      const result = await response.json();

      if (response.ok) {
        setGroupPurchases(result.groupPurchases || []);
        updateStats(result.groupPurchases || []);
      } else {
        throw new Error(result.error || 'Failed to fetch group purchases');
      }
    } catch (error: any) {
      console.error('Fetch group purchases error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch group purchases',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (groups: GroupPurchase[]) => {
    const totalSavings = groups.reduce((sum, group) => {
      const originalPrice = group.unit_price;
      const discountPercentage = group.group_discount_percentage || 0;
      const savings = originalPrice * (discountPercentage / 100) * (group.my_quantity || 0);
      return sum + savings;
    }, 0);

    setStats({
      totalAvailable: activeTab === 'available' ? groups.length : stats.totalAvailable,
      myGroups: activeTab === 'my_groups' ? groups.length : stats.myGroups,
      myOrganized: activeTab === 'my_organized' ? groups.length : stats.myOrganized,
      totalSavings
    });
  };

  const handleJoinGroup = async (groupPurchaseId: number) => {
    setSelectedGroupForJoin(groupPurchaseId);
  };

  const handleJoinSuccess = () => {
    setSelectedGroupForJoin(null);
    fetchGroupPurchases();
    toast({
      title: 'Success',
      description: 'Successfully joined group purchase!',
      variant: 'default'
    });
  };

  const handleCreateSuccess = (groupPurchaseId: number) => {
    fetchGroupPurchases();
    setActiveTab('my_organized');
  };

  const filteredGroupPurchases = groupPurchases.filter(group => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        group.title.toLowerCase().includes(query) ||
        group.product_name.toLowerCase().includes(query) ||
        group.organizer_name.toLowerCase().includes(query) ||
        group.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Please log in to access group purchases.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Group Purchases</h1>
          <p className="text-muted-foreground">
            Join forces with other buyers to get bulk pricing and share costs
          </p>
        </div>
        <CreateGroupPurchase onSuccess={handleCreateSuccess} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Groups</p>
                <p className="text-2xl font-bold">{stats.totalAvailable}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">My Groups</p>
                <p className="text-2xl font-bold">{stats.myGroups}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Organized</p>
                <p className="text-2xl font-bold">{stats.myOrganized}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Savings</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalSavings.toFixed(2)} Birr</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                <SelectItem value="Grains">Grains</SelectItem>
                <SelectItem value="Coffee">Coffee</SelectItem>
                <SelectItem value="Spices">Spices</SelectItem>
                <SelectItem value="Vegetables">Vegetables</SelectItem>
                <SelectItem value="Fruits">Fruits</SelectItem>
                <SelectItem value="Pulses">Pulses</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />

            <Input
              type="number"
              placeholder="Max price per kg..."
              value={maxPriceFilter}
              onChange={(e) => setMaxPriceFilter(e.target.value)}
            />

            {activeTab !== 'available' && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Button
              variant="outline"
              onClick={fetchGroupPurchases}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available Groups</TabsTrigger>
          <TabsTrigger value="my_groups">My Groups</TabsTrigger>
          <TabsTrigger value="my_organized">My Organized</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Available Group Purchases</h2>
            <Badge variant="outline">{filteredGroupPurchases.length} groups</Badge>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredGroupPurchases.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Group Purchases Found</h3>
                <p className="text-muted-foreground mb-4">
                  There are no available group purchases matching your criteria.
                </p>
                <CreateGroupPurchase onSuccess={handleCreateSuccess} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroupPurchases.map((group) => (
                <GroupPurchaseCard
                  key={group.id}
                  groupPurchase={group}
                  showJoinButton={true}
                  onJoin={handleJoinGroup}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my_groups" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Group Purchases</h2>
            <Badge variant="outline">{filteredGroupPurchases.length} groups</Badge>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredGroupPurchases.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Group Purchases Yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't joined any group purchases yet. Browse available groups to get started.
                </p>
                <Button onClick={() => setActiveTab('available')}>
                  Browse Available Groups
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroupPurchases.map((group) => (
                <GroupPurchaseCard
                  key={group.id}
                  groupPurchase={group}
                  showJoinButton={false}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my_organized" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Groups I Organized</h2>
            <Badge variant="outline">{filteredGroupPurchases.length} groups</Badge>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredGroupPurchases.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Organized Groups Yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't organized any group purchases yet. Create your first group to get started.
                </p>
                <CreateGroupPurchase onSuccess={handleCreateSuccess} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroupPurchases.map((group) => (
                <GroupPurchaseCard
                  key={group.id}
                  groupPurchase={group}
                  showJoinButton={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Join Group Dialog */}
      {selectedGroupForJoin && (
        <JoinGroupDialog
          groupPurchaseId={selectedGroupForJoin}
          isOpen={!!selectedGroupForJoin}
          onClose={() => setSelectedGroupForJoin(null)}
          onSuccess={handleJoinSuccess}
        />
      )}
    </div>
  );
}
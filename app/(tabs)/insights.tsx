import "@/global.css";
import { View, Text, FlatList } from 'react-native'
import React, { useMemo } from 'react'
import { styled } from 'nativewind';
import { SafeAreaView as RNSafe } from "react-native-safe-area-context";
import { HOME_SUBSCRIPTIONS } from '@/constants/data';
import { formatCurrency } from '@/constants/lib/utils';
import ListHeading from '@/components/listheading';

const SafeAreaView = styled(RNSafe);

interface CategorySpending {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

interface StatusBreakdown {
  status: 'active' | 'paused' | 'cancelled';
  count: number;
  percentage: number;
}

const Insights = () => {
  const insightsData = useMemo(() => {
    const activeSubscriptions = HOME_SUBSCRIPTIONS.filter(s => s.status === 'active');
    const pausedSubscriptions = HOME_SUBSCRIPTIONS.filter(s => s.status === 'paused');
    const cancelledSubscriptions = HOME_SUBSCRIPTIONS.filter(s => s.status === 'cancelled');

    // Total monthly spending (only active subscriptions)
    const monthlySpending = activeSubscriptions.reduce((sum, sub) => {
      if (sub.billing === 'Monthly') return sum + sub.price;
      if (sub.billing === 'Yearly') return sum + (sub.price / 12);
      return sum;
    }, 0);

    // Annual spending projection
    const annualSpending = monthlySpending * 12;

    // Spending by category
    const categoryMap = new Map<string, CategorySpending>();
    activeSubscriptions.forEach(sub => {
      const monthlyPrice = sub.billing === 'Monthly' ? sub.price : sub.price / 12;
      if (!categoryMap.has(sub.category!)) {
        categoryMap.set(sub.category!, {
          category: sub.category!,
          total: monthlyPrice,
          count: 1,
          percentage: 0,
        });
      } else {
        const current = categoryMap.get(sub.category!)!;
        current.total += monthlyPrice;
        current.count += 1;
      }
    });

    // Calculate percentages
    const categorySpending = Array.from(categoryMap.values())
      .map(cat => ({
        ...cat,
        percentage: Math.round((cat.total / monthlySpending) * 100),
      }))
      .sort((a, b) => b.total - a.total);

    // Status breakdown
    const statusBreakdown: StatusBreakdown[] = [
      {
        status: 'active',
        count: activeSubscriptions.length,
        percentage: Math.round((activeSubscriptions.length / HOME_SUBSCRIPTIONS.length) * 100),
      },
      {
        status: 'paused',
        count: pausedSubscriptions.length,
        percentage: Math.round((pausedSubscriptions.length / HOME_SUBSCRIPTIONS.length) * 100),
      },
      {
        status: 'cancelled',
        count: cancelledSubscriptions.length,
        percentage: Math.round((cancelledSubscriptions.length / HOME_SUBSCRIPTIONS.length) * 100),
      },
    ];

    // Top subscriptions by cost
    const topSubscriptions = HOME_SUBSCRIPTIONS
      .filter(s => s.status === 'active')
      .sort((a, b) => b.price - a.price)
      .slice(0, 5);

    return {
      monthlySpending,
      annualSpending,
      totalCount: HOME_SUBSCRIPTIONS.length,
      activeCount: activeSubscriptions.length,
      categorySpending,
      statusBreakdown,
      topSubscriptions,
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#16a34a';
      case 'paused': return '#f59e0b';
      case 'cancelled': return '#dc2626';
      default: return '#666';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'paused': return 'Paused';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        ListHeaderComponent={() => (
          <>
            {/* Header */}
            <View className="px-5 pt-2 pb-5">
              <Text className="text-3xl font-sans-extrabold text-primary">Insights</Text>
            </View>

            {/* Key Metrics Cards */}
            <View className="px-5 gap-4 mb-6">
              {/* Monthly Spending Card */}
              <View className="home-balance-card">
                <Text className="home-balance-label">Monthly Spending</Text>
                <View className="home-balance-row">
                  <Text className="home-balance-amount">{formatCurrency(insightsData.monthlySpending)}</Text>
                  <View className="items-end">
                    <Text className="home-balance-date">{formatCurrency(insightsData.annualSpending)}</Text>
                    <Text className="text-sm font-sans-medium text-white/70">per year</Text>
                  </View>
                </View>
              </View>

              {/* Quick Stats */}
              <View className="flex-row gap-4">
                <View className="flex-1 rounded-2xl bg-card border border-border p-4">
                  <Text className="text-sm font-sans-semibold text-muted-foreground mb-2">Active</Text>
                  <Text className="text-2xl font-sans-extrabold text-primary">{insightsData.activeCount}</Text>
                  <Text className="text-xs font-sans-medium text-muted-foreground mt-1">subscriptions</Text>
                </View>
                <View className="flex-1 rounded-2xl bg-card border border-border p-4">
                  <Text className="text-sm font-sans-semibold text-muted-foreground mb-2">Total</Text>
                  <Text className="text-2xl font-sans-extrabold text-primary">{insightsData.totalCount}</Text>
                  <Text className="text-xs font-sans-medium text-muted-foreground mt-1">subscriptions</Text>
                </View>
              </View>
            </View>

            {/* Spending by Category */}
            <View className="px-5">
              <ListHeading title="Spending by Category" />
              <View className="gap-3">
                {insightsData.categorySpending.map((category) => (
                  <View key={category.category} className="rounded-2xl bg-card border border-border p-4">
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1">
                        <Text className="text-lg font-sans-bold text-primary">{category.category}</Text>
                        <Text className="text-sm font-sans-medium text-muted-foreground">{category.count} subscription{category.count > 1 ? 's' : ''}</Text>
                      </View>
                      <Text className="text-lg font-sans-bold text-primary">{formatCurrency(category.total)}</Text>
                    </View>
                    {/* Progress Bar */}
                    <View className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <View 
                        style={{ 
                          width: `${category.percentage}%`,
                          backgroundColor: '#ea7a53',
                          height: '100%'
                        }} 
                      />
                    </View>
                    <Text className="text-xs font-sans-medium text-muted-foreground mt-2">{category.percentage}% of monthly spending</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Status Breakdown */}
            <View className="px-5 mt-6">
              <ListHeading title="Subscription Status" />
              <View className="gap-3">
                {insightsData.statusBreakdown.map((status) => (
                  <View key={status.status} className="rounded-2xl bg-card border border-border p-4">
                    <View className="flex-row justify-between items-center mb-2">
                      <View className="flex-row items-center gap-3 flex-1">
                        <View 
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: getStatusColor(status.status),
                          }}
                        />
                        <Text className="text-lg font-sans-bold text-primary">{getStatusLabel(status.status)}</Text>
                      </View>
                      <Text className="text-lg font-sans-bold text-primary">{status.count}</Text>
                    </View>
                    <View className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <View 
                        style={{
                          width: `${status.percentage || 0}%`,
                          backgroundColor: getStatusColor(status.status),
                          height: '100%'
                        }}
                      />
                    </View>
                    <Text className="text-xs font-sans-medium text-muted-foreground mt-2">{status.percentage}% of total</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Top Subscriptions */}
            <View className="px-5 mt-6">
              <ListHeading title="Most Expensive" />
              <View className="gap-3">
                {insightsData.topSubscriptions.map((sub, index) => (
                  <View key={sub.id} className="flex-row items-center justify-between rounded-2xl bg-card border border-border p-4">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="w-10 h-10 rounded-lg bg-muted items-center justify-center">
                        <Text className="text-sm font-sans-bold text-primary">#{index + 1}</Text>
                      </View>
                      <View className="flex-1 min-w-0">
                        <Text className="text-lg font-sans-bold text-primary">{sub.name}</Text>
                        <Text className="text-sm font-sans-medium text-muted-foreground">{sub.billing}</Text>
                      </View>
                    </View>
                    <Text className="text-lg font-sans-bold text-primary ml-2">{formatCurrency(sub.price)}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
        data={[]}
        contentContainerClassName="pb-30"
        renderItem={() => (null)}
      />
    </SafeAreaView>
  )
}

export default Insights
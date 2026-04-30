import "@/global.css";
import { FlatList, Image, Text, View, Pressable } from "react-native";
import { styled } from 'nativewind';
import { SafeAreaView as RNSafe } from "react-native-safe-area-context";
import images from '@/constants/images';
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/constants/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/listheading";
import SubscriptionCard from "@/components/subscriptionCard";
import SubCard from "@/components/SubCard";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import { useState } from "react";

const SafeAreaView = styled(RNSafe);

export default function App() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(HOME_SUBSCRIPTIONS);
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddSubscription = (subscription: Subscription) => {
    setSubscriptions(prev => [subscription, ...prev]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image source={images.avatar} className="home-avatar" />
                <Text className="home-user-name">{HOME_USER.name}</Text>
              </View>

              {/* Tappable "+" icon opens the modal */}
              <Pressable onPress={() => setModalVisible(true)} hitSlop={8}>
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
                <Text className="home-balance-date">{dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}</Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading title='Upcoming' />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (
                  <SubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">No Upcoming renewals yet.</Text>
                } />
            </View>
            <ListHeading title='All Subscriptions' />
          </>
        )}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => setExpandedSubscriptionId(expandedSubscriptionId === item.id ? null : item.id)} />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text className="home-empty-state">No Subscriptions yet</Text>}
        contentContainerClassName="pb-30" />

      <CreateSubscriptionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddSubscription}
      />
    </SafeAreaView>
  );
}
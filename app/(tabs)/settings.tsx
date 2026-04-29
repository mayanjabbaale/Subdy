import { View, Text, Pressable, ScrollView, Switch, Alert, Modal } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth, useUser } from '@clerk/expo'
import { useRouter } from 'expo-router'

// ─── Tiny icon glyphs rendered as Text ───────────────────────────────────────
const ICONS: Record<string, string> = {
  profile:       '👤',
  notifications: '🔔',
  currency:      '💱',
  privacy:       '🔒',
  theme:         '🎨',
  billing:       '💳',
  help:          '💬',
  feedback:      '⭐',
  about:         '📋',
  logout:        '🚪',
  chevron:       '›',
  check:         '✓',
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'UGX', 'KES', 'NGN', 'ZAR', 'JPY', 'CAD', 'AUD']

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={{ marginBottom: 24 }}>
    <Text style={{
      fontFamily: 'sans-semibold', fontSize: 11,
      color: '#9ca3af', letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: 10, paddingHorizontal: 4,
    }}>
      {title}
    </Text>
    <View style={{
      backgroundColor: '#fffef9',
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: '#ede8de',
      overflow: 'hidden',
    }}>
      {children}
    </View>
  </View>
)

// ─── Row with chevron ─────────────────────────────────────────────────────────
const SettingRow = ({
  icon, label, value, onPress, last = false, danger = false,
}: {
  icon: string; label: string; value?: string;
  onPress?: () => void; last?: boolean; danger?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => ({
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 18, paddingVertical: 15,
      borderBottomWidth: last ? 0 : 1,
      borderBottomColor: '#f0ebe0',
      backgroundColor: pressed ? '#fdf7ef' : 'transparent',
    })}
  >
    <View style={{
      width: 34, height: 34, borderRadius: 10,
      backgroundColor: danger ? '#fff1ee' : '#faf3e8',
      alignItems: 'center', justifyContent: 'center',
      marginRight: 14,
    }}>
      <Text style={{ fontSize: 16 }}>{icon}</Text>
    </View>
    <Text style={{
      fontFamily: 'sans-medium', fontSize: 15,
      color: danger ? '#ea7a53' : '#1a1a2e',
      flex: 1,
    }}>
      {label}
    </Text>
    {value && (
      <Text style={{
        fontFamily: 'sans-regular', fontSize: 13,
        color: '#9ca3af', marginRight: 6,
      }}>
        {value}
      </Text>
    )}
    <Text style={{
      fontSize: 20, color: danger ? '#ea7a53' : '#c4bfb3',
      fontFamily: 'sans-light',
    }}>
      {ICONS.chevron}
    </Text>
  </Pressable>
)

// ─── Row with toggle ──────────────────────────────────────────────────────────
const ToggleRow = ({
  icon, label, description, value, onToggle, last = false,
}: {
  icon: string; label: string; description?: string;
  value: boolean; onToggle: (v: boolean) => void; last?: boolean;
}) => (
  <View style={{
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 14,
    borderBottomWidth: last ? 0 : 1,
    borderBottomColor: '#f0ebe0',
  }}>
    <View style={{
      width: 34, height: 34, borderRadius: 10,
      backgroundColor: '#faf3e8',
      alignItems: 'center', justifyContent: 'center',
      marginRight: 14,
    }}>
      <Text style={{ fontSize: 16 }}>{icon}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: 'sans-medium', fontSize: 15, color: '#1a1a2e' }}>
        {label}
      </Text>
      {description && (
        <Text style={{
          fontFamily: 'sans-regular', fontSize: 12,
          color: '#9ca3af', marginTop: 2,
        }}>
          {description}
        </Text>
      )}
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: '#e5e0d4', true: '#ea7a53' }}
      thumbColor={'#fff'}
      ios_backgroundColor="#e5e0d4"
    />
  </View>
)

// ─── Currency picker modal ────────────────────────────────────────────────────
const CurrencyModal = ({
  visible, selected, onSelect, onClose,
}: {
  visible: boolean; selected: string;
  onSelect: (c: string) => void; onClose: () => void;
}) => (
  <Modal visible={visible} transparent animationType="slide">
    <Pressable
      style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' }}
      onPress={onClose}
    >
      <View style={{
        backgroundColor: '#fff9e3',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingTop: 12, paddingBottom: 40,
      }}>
        {/* Handle */}
        <View style={{
          width: 40, height: 4, borderRadius: 2,
          backgroundColor: '#e5e0d4', alignSelf: 'center', marginBottom: 20,
        }} />
        <Text style={{
          fontFamily: 'sans-bold', fontSize: 18,
          color: '#1a1a2e', paddingHorizontal: 24, marginBottom: 16,
        }}>
          Display currency
        </Text>
        {CURRENCIES.map((c, i) => (
          <Pressable
            key={c}
            onPress={() => { onSelect(c); onClose(); }}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center',
              paddingHorizontal: 24, paddingVertical: 14,
              backgroundColor: pressed ? '#fdf7ef' : 'transparent',
            })}
          >
            <Text style={{
              fontFamily: selected === c ? 'sans-bold' : 'sans-regular',
              fontSize: 15,
              color: selected === c ? '#ea7a53' : '#374151',
              flex: 1,
            }}>
              {c}
            </Text>
            {selected === c && (
              <Text style={{ color: '#ea7a53', fontSize: 16, fontFamily: 'sans-bold' }}>
                {ICONS.check}
              </Text>
            )}
          </Pressable>
        ))}
      </View>
    </Pressable>
  </Modal>
)

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function Settings() {
  const { signOut } = useAuth()
  const { user } = useUser()
  const router = useRouter()

  const [renewalAlerts, setRenewalAlerts]     = useState(true)
  const [weeklyDigest, setWeeklyDigest]       = useState(false)
  const [priceChanges, setPriceChanges]       = useState(true)
  const [currency, setCurrency]               = useState('USD')
  const [currencyModal, setCurrencyModal]     = useState(false)

  const handleLogout = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            await signOut()
            router.replace('/(auth)/sign_in')
          },
        },
      ]
    )
  }

  const email = user?.primaryEmailAddress?.emailAddress ?? ''
  const initials = email
    ? email.slice(0, 2).toUpperCase()
    : '??'

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff9e3' }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Page title */}
        <Text style={{
          fontFamily: 'sans-extrabold', fontSize: 28,
          color: '#1a1a2e', marginBottom: 24, marginTop: 4,
        }}>
          Settings
        </Text>

        {/* Profile card */}
        <Pressable
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#fdf7ef' : '#fffef9',
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: '#ede8de',
            padding: 18,
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 28,
          })}
        >
          {/* Avatar */}
          <View style={{
            width: 52, height: 52, borderRadius: 16,
            backgroundColor: '#ea7a53',
            alignItems: 'center', justifyContent: 'center',
            marginRight: 14,
            shadowColor: '#ea7a53',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25, shadowRadius: 8,
            elevation: 3,
          }}>
            <Text style={{
              fontFamily: 'sans-bold', fontSize: 18, color: '#fff',
            }}>
              {initials}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{
              fontFamily: 'sans-bold', fontSize: 16, color: '#1a1a2e',
              marginBottom: 3,
            }}>
              {user?.fullName ?? 'Your Account'}
            </Text>
            <Text style={{
              fontFamily: 'sans-regular', fontSize: 13, color: '#9ca3af',
            }}
              numberOfLines={1}
            >
              {email}
            </Text>
          </View>

          <View style={{
            paddingHorizontal: 12, paddingVertical: 6,
            backgroundColor: '#faf3e8',
            borderRadius: 20,
            borderWidth: 1, borderColor: '#ede8de',
          }}>
            <Text style={{
              fontFamily: 'sans-semibold', fontSize: 11, color: '#ea7a53',
            }}>
              Free plan
            </Text>
          </View>
        </Pressable>

        {/* Account */}
        <Section title="Account">
          <SettingRow icon={ICONS.profile}  label="Edit profile" onPress={() => {}} />
          <SettingRow icon={ICONS.billing}  label="Subscription plan" value="Free" onPress={() => {}} />
          <SettingRow icon={ICONS.privacy}  label="Privacy & data" onPress={() => {}} last />
        </Section>

        {/* Preferences */}
        <Section title="Preferences">
          <SettingRow
            icon={ICONS.currency}
            label="Display currency"
            value={currency}
            onPress={() => setCurrencyModal(true)}
          />
          <SettingRow icon={ICONS.theme} label="Appearance" value="System" onPress={() => {}} last />
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <ToggleRow
            icon="🔔"
            label="Renewal alerts"
            description="Get notified 3 days before renewal"
            value={renewalAlerts}
            onToggle={setRenewalAlerts}
          />
          <ToggleRow
            icon="📊"
            label="Weekly digest"
            description="Summary of upcoming charges"
            value={weeklyDigest}
            onToggle={setWeeklyDigest}
          />
          <ToggleRow
            icon="💰"
            label="Price change alerts"
            description="When a subscription price changes"
            value={priceChanges}
            onToggle={setPriceChanges}
            last
          />
        </Section>

        {/* Support */}
        <Section title="Support">
          <SettingRow icon={ICONS.help}     label="Help centre"      onPress={() => {}} />
          <SettingRow icon={ICONS.feedback} label="Rate the app"     onPress={() => {}} />
          <SettingRow icon={ICONS.about}    label="About"            onPress={() => {}} last />
        </Section>

        {/* Danger zone */}
        <Section title="Session">
          <SettingRow
            icon={ICONS.logout}
            label="Sign out"
            onPress={handleLogout}
            danger
            last
          />
        </Section>

        <Text style={{
          textAlign: 'center',
          fontFamily: 'sans-regular', fontSize: 12,
          color: '#c4bfb3', marginTop: 8,
        }}>
          Subdy v1.0.0
        </Text>
      </ScrollView>

      <CurrencyModal
        visible={currencyModal}
        selected={currency}
        onSelect={setCurrency}
        onClose={() => setCurrencyModal(false)}
      />
    </SafeAreaView>
  )
}
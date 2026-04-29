import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { icons } from '@/constants/icons';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
}

type Frequency = 'Monthly' | 'Yearly';

const CATEGORIES = [
  'Entertainment',
  'AI Tools',
  'Developer Tools',
  'Design',
  'Productivity',
  'Cloud',
  'Music',
  'Other',
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: '#f9c74f',
  'AI Tools':     '#b8d4e3',
  'Developer Tools': '#e8def8',
  Design:         '#f5c542',
  Productivity:   '#c3f0ca',
  Cloud:          '#aed9e0',
  Music:          '#f4a261',
  Other:          '#d5bdaf',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onSubmit,
}: CreateSubscriptionModalProps) {
  const insets = useSafeAreaInsets();

  const [name, setName]           = useState('');
  const [price, setPrice]         = useState('');
  const [frequency, setFrequency] = useState<Frequency>('Monthly');
  const [category, setCategory]   = useState('');
  const [focused, setFocused]     = useState<string | null>(null);
  const [errors, setErrors]       = useState<{ name?: string; price?: string }>({});

  // ── Validation ──────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const next: { name?: string; price?: string } = {};
    if (!name.trim()) {
      next.name = 'Name is required';
    }
    const parsed = parseFloat(price);
    if (!price.trim() || isNaN(parsed) || parsed <= 0) {
      next.price = 'Enter a valid positive price';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    if (!validate()) return;

    const now      = dayjs().toISOString();
    const renewal  = frequency === 'Monthly'
      ? dayjs().add(1, 'month').toISOString()
      : dayjs().add(1, 'year').toISOString();

    const id = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const subscription: Subscription = {
      id,
      icon:          icons.wallet,
      name:          name.trim(),
      price:         parseFloat(price),
      currency:      'USD',
      billing:       frequency,
      category:      category || 'Other',
      plan:          category || 'Other',
      status:        'active',
      startDate:     now,
      renewalDate:   renewal,
      color:         CATEGORY_COLORS[category] ?? CATEGORY_COLORS['Other'],
      paymentMethod: '',
    };

    onSubmit(subscription);

    // reset
    setName('');
    setPrice('');
    setFrequency('Monthly');
    setCategory('');
    setErrors({});
    onClose();
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const isSubmitDisabled = !name.trim() || !price.trim();

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/*
        KeyboardAvoidingView wraps the ENTIRE modal content so it can shift
        the sheet up as a unit when the keyboard appears, without hiding the
        header or drag handle.
      */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kavContainer}
      >
        {/* Tappable overlay — sits above KAV's flex space, below the sheet */}
        <Pressable style={styles.overlay} onPress={onClose} />

        {/* Sheet — anchored to the bottom by the flex column layout */}
        <View
          style={[
            styles.sheet,
            // Only add bottom padding for the home-indicator on iOS.
            // Do NOT use insets.bottom here because the Modal renders
            // outside the SafeAreaView tree; on Android it would double-count.
            { paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : 16 },
          ]}
        >
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View className="modal-header">
            <Text className="modal-title">New Subscription</Text>
            <TouchableOpacity className="modal-close" onPress={onClose}>
              <Text className="modal-close-text">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* ── Name ─────────────────────────────────────────────────────── */}
            <View className="auth-field">
              <Text className="auth-label">Name</Text>
              <TextInput
                className={clsx('auth-input', errors.name && 'auth-input-error')}
                placeholder="e.g. Netflix, Spotify…"
                placeholderTextColor="#c4bfb3"
                value={name}
                onChangeText={t => { setName(t); setErrors(e => ({ ...e, name: undefined })); }}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                style={{
                  borderColor: errors.name
                    ? '#dc2626'
                    : focused === 'name'
                      ? '#ea7a53'
                      : 'rgba(0,0,0,0.1)',
                  borderWidth: focused === 'name' ? 2 : 1.5,
                }}
              />
              {errors.name && <Text className="auth-error">{errors.name}</Text>}
            </View>

            {/* ── Price ────────────────────────────────────────────────────── */}
            <View className="auth-field" style={{ marginTop: 16 }}>
              <Text className="auth-label">Price (USD)</Text>
              <TextInput
                className={clsx('auth-input', errors.price && 'auth-input-error')}
                placeholder="0.00"
                placeholderTextColor="#c4bfb3"
                value={price}
                onChangeText={t => { setPrice(t); setErrors(e => ({ ...e, price: undefined })); }}
                keyboardType="decimal-pad"
                onFocus={() => setFocused('price')}
                onBlur={() => setFocused(null)}
                style={{
                  borderColor: errors.price
                    ? '#dc2626'
                    : focused === 'price'
                      ? '#ea7a53'
                      : 'rgba(0,0,0,0.1)',
                  borderWidth: focused === 'price' ? 2 : 1.5,
                }}
              />
              {errors.price && <Text className="auth-error">{errors.price}</Text>}
            </View>

            {/* ── Frequency ────────────────────────────────────────────────── */}
            <View style={{ marginTop: 16 }}>
              <Text className="auth-label" style={{ marginBottom: 8 }}>Billing frequency</Text>
              <View className="picker-row">
                {(['Monthly', 'Yearly'] as Frequency[]).map(f => (
                  <Pressable
                    key={f}
                    className={clsx('picker-option', frequency === f && 'picker-option-active')}
                    onPress={() => setFrequency(f)}
                  >
                    <Text
                      className={clsx(
                        'picker-option-text',
                        frequency === f && 'picker-option-text-active',
                      )}
                    >
                      {f}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* ── Category ─────────────────────────────────────────────────── */}
            <View style={{ marginTop: 16 }}>
              <Text className="auth-label" style={{ marginBottom: 8 }}>Category</Text>
              <View className="category-scroll">
                {CATEGORIES.map(cat => (
                  <Pressable
                    key={cat}
                    className={clsx('category-chip', category === cat && 'category-chip-active')}
                    onPress={() => setCategory(prev => prev === cat ? '' : cat)}
                  >
                    <Text
                      className={clsx(
                        'category-chip-text',
                        category === cat && 'category-chip-text-active',
                      )}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* ── Submit ───────────────────────────────────────────────────── */}
            <Pressable
              className={clsx('auth-button', isSubmitDisabled && 'auth-button-disabled')}
              style={{ marginTop: 28, marginBottom: 8 }}
              onPress={handleSubmit}
              disabled={isSubmitDisabled}
            >
              <Text className="auth-button-text">Add Subscription</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Fills the full screen so the overlay + sheet stack correctly
  kavContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  // Semi-transparent backdrop — StyleSheet.absoluteFillObject keeps it behind
  // the sheet but above the content underneath the modal
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#fff9e3',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    // Cap height so there is always visible overlay on tall-content devices
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e0d4',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 0,
  },
});
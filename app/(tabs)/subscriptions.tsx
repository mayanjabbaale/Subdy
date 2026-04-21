import { View, Text, TextInput, FlatList, Pressable, ScrollView } from 'react-native'
import React, { useState, useMemo, useRef, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { styled } from 'nativewind'
import { HOME_SUBSCRIPTIONS } from '@/constants/data'
import SubCard from '@/components/SubCard'

const StyledSafeAreaView = styled(SafeAreaView)

const ALL_LABEL = 'All'

// Derived once at module level — never changes
const CATEGORIES: string[] = [
  ALL_LABEL,
  ...Array.from(
    new Set(
      HOME_SUBSCRIPTIONS
        .map((s: any) => s.category)
        .filter(Boolean)
    )
  ),
]

const HAS_CATEGORIES = CATEGORIES.length > 1

export default function Subscriptions() {
  const [query, setQuery]               = useState('')
  const [activeCategory, setActiveCategory] = useState(ALL_LABEL)
  const [expandedId, setExpandedId]     = useState<string | null>(null)
  const [focused, setFocused]           = useState(false)
  const inputRef                        = useRef<TextInput>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return HOME_SUBSCRIPTIONS.filter((s: any) => {
      const matchesQuery =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
      const matchesCategory =
        activeCategory === ALL_LABEL || s.category === activeCategory
      return matchesQuery && matchesCategory
    })
  }, [query, activeCategory])

  const clearSearch = useCallback(() => {
    setQuery('')
    setActiveCategory(ALL_LABEL)
  }, [])

  const handleCardPress = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }, [])

  const renderItem = useCallback(({ item }: { item: any }) => (
    <View style={{ paddingHorizontal: 20 }}>
      <SubCard
        {...item}
        expanded={expandedId === item.id}
        onPress={() => handleCardPress(item.id)}
      />
    </View>
  ), [expandedId, handleCardPress])

  const isFiltering = query.length > 0 || activeCategory !== ALL_LABEL

  return (
    <StyledSafeAreaView className="flex-1 bg-background">

      {/* ── Fixed header — lives OUTSIDE the FlatList so TextInput never unmounts ── */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>

        {/* Title row */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 16,
        }}>
          <Text style={{
            fontFamily: 'sans-extrabold', fontSize: 28, color: '#1a1a2e',
          }}>
            Subscriptions
          </Text>
          <View style={{
            paddingHorizontal: 12, paddingVertical: 5,
            backgroundColor: '#ea7a53', borderRadius: 20,
          }}>
            <Text style={{ fontFamily: 'sans-bold', fontSize: 13, color: '#fff' }}>
              {HOME_SUBSCRIPTIONS.length}
            </Text>
          </View>
        </View>

        {/* Search bar */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: '#fffef9',
          borderRadius: 16,
          borderWidth: focused ? 2 : 1.5,
          borderColor: focused ? '#ea7a53' : '#ede8de',
          paddingHorizontal: 14,
          paddingVertical: 11,
          gap: 10,
        }}>
          <Text style={{ fontSize: 16, opacity: 0.5 }}>🔍</Text>
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search subscriptions…"
            placeholderTextColor="#c4bfb3"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              flex: 1,
              fontFamily: 'sans-regular', fontSize: 15,
              color: '#1a1a2e',
              padding: 0,
            }}
            returnKeyType="search"
            autoCorrect={false}
            autoComplete="off"
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => setQuery('')}
              hitSlop={8}
              style={{
                width: 20, height: 20, borderRadius: 10,
                backgroundColor: '#e5e0d4',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{
                fontFamily: 'sans-bold', fontSize: 11,
                color: '#6b7280', lineHeight: 14,
              }}>
                ✕
              </Text>
            </Pressable>
          )}
        </View>

        {/* Category pills */}
        {HAS_CATEGORIES && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 12 }}
            keyboardShouldPersistTaps="handled"
          >
            {CATEGORIES.map(cat => {
              const active = cat === activeCategory
              return (
                <Pressable
                  key={cat}
                  onPress={() => setActiveCategory(cat)}
                  style={{
                    paddingHorizontal: 16, paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: active ? '#ea7a53' : '#fffef9',
                    borderWidth: 1.5,
                    borderColor: active ? '#ea7a53' : '#ede8de',
                  }}
                >
                  <Text style={{
                    fontFamily: active ? 'sans-bold' : 'sans-medium',
                    fontSize: 13,
                    color: active ? '#fff' : '#6b7280',
                  }}>
                    {cat}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>
        )}

        {/* Results summary — only shown while filtering */}
        {isFiltering && (
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 8,
          }}>
            <Text style={{
              fontFamily: 'sans-regular', fontSize: 13, color: '#9ca3af',
            }}>
              {filtered.length === 0
                ? 'No results'
                : `${filtered.length} result${filtered.length === 1 ? '' : 's'}`}
            </Text>
            <Pressable onPress={clearSearch} hitSlop={8}>
              <Text style={{
                fontFamily: 'sans-semibold', fontSize: 13, color: '#ea7a53',
              }}>
                Clear filters
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* ── Scrollable list ── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        extraData={expandedId}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingTop: 4, paddingBottom: 120 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={() => (
          <View style={{
            alignItems: 'center', paddingTop: 60, paddingHorizontal: 40,
          }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
            <Text style={{
              fontFamily: 'sans-bold', fontSize: 18,
              color: '#1a1a2e', marginBottom: 8, textAlign: 'center',
            }}>
              No subscriptions found
            </Text>
            <Text style={{
              fontFamily: 'sans-regular', fontSize: 14,
              color: '#9ca3af', textAlign: 'center', lineHeight: 22,
            }}>
              Try a different search term or clear your filters.
            </Text>
            <Pressable
              onPress={clearSearch}
              style={{
                marginTop: 20,
                paddingHorizontal: 24, paddingVertical: 12,
                backgroundColor: '#ea7a53', borderRadius: 14,
              }}
            >
              <Text style={{ fontFamily: 'sans-bold', fontSize: 14, color: '#fff' }}>
                Clear filters
              </Text>
            </Pressable>
          </View>
        )}
      />

    </StyledSafeAreaView>
  )
}
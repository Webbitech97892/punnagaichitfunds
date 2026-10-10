import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BottomTabBarProps as RNBottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, spacing, radius, typography, moderateScale } from '../theme';

export type TabScreenName = 'Home' | 'Collection' | 'Transaction' | 'MyAccount';

export interface StandaloneBottomTabBarProps {
  currentTab: TabScreenName;
  onTabPress: (tab: TabScreenName) => void;
}

export type CustomBottomTabBarProps = RNBottomTabBarProps | StandaloneBottomTabBarProps;
export type BottomTabBarProps = CustomBottomTabBarProps;

function isRNProps(props: any): props is RNBottomTabBarProps {
  return Boolean(props && props.state && Array.isArray(props.state.routes));
}

export default function BottomTabBar(props: CustomBottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  if (isKeyboardVisible) {
    return null;
  }

  const tabs: {
    key: TabScreenName;
    label: string;
    activeIcon: string;
    inactiveIcon: string;
  }[] = [
    {
      key: 'Home',
      label: 'Home',
      activeIcon: 'home',
      inactiveIcon: 'home-outline',
    },
    {
      key: 'Collection',
      label: 'Collection',
      activeIcon: 'wallet',
      inactiveIcon: 'wallet-outline',
    },
    {
      key: 'Transaction',
      label: 'Reports',
      activeIcon: 'receipt',
      inactiveIcon: 'receipt-outline',
    },
    {
      key: 'MyAccount',
      label: 'Profile',
      activeIcon: 'person',
      inactiveIcon: 'person-outline',
    },
  ];

  if (isRNProps(props)) {
    const { state, navigation } = props;
    const currentRoute = state.routes[state.index];
    const currentRouteName = currentRoute ? (currentRoute.name as TabScreenName) : 'Home';

    return (
      <View
        style={[
          styles.container,
          {
            paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? spacing.sm : spacing.xs),
          },
        ]}
      >
        <View style={styles.tabRow}>
          {tabs.map((tab) => {
            const isActive = currentRouteName === tab.key;
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: tab.key,
                canPreventDefault: true,
              });

              if (!isActive && !event.defaultPrevented) {
                navigation.navigate(tab.key);
              }
            };

            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                onPress={onPress}
                activeOpacity={0.75}
              >
                {/* Active Top Glow Line */}
                <View style={[styles.topIndicator, isActive && styles.activeTopIndicator]} />

                <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
                  <Ionicons
                    name={isActive ? tab.activeIcon : tab.inactiveIcon}
                    size={moderateScale(21)}
                    color={isActive ? colors.primary : '#64748B'}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    isActive ? styles.activeTabLabel : styles.inactiveTabLabel,
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  const { currentTab, onTabPress } = props as StandaloneBottomTabBarProps;

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? spacing.sm : spacing.xs),
        },
      ]}
    >
      <View style={styles.tabRow}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => onTabPress(tab.key)}
              activeOpacity={0.75}
            >
              <View style={[styles.topIndicator, isActive && styles.activeTopIndicator]} />

              <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.inactiveIcon}
                  size={moderateScale(21)}
                  color={isActive ? colors.primary : '#64748B'}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.activeTabLabel : styles.inactiveTabLabel,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    position: 'relative',
  },
  topIndicator: {
    position: 'absolute',
    top: -4,
    width: moderateScale(22),
    height: 3,
    borderRadius: radius.full,
    backgroundColor: 'transparent',
  },
  activeTopIndicator: {
    backgroundColor: colors.primary,
  },
  iconWrapper: {
    width: moderateScale(40),
    height: moderateScale(28),
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  activeIconWrapper: {
    backgroundColor: '#EFF6FF',
  },
  tabLabel: {
    ...typography.caption,
    fontSize: moderateScale(11),
    marginTop: 2,
    letterSpacing: 0.2,
  },
  activeTabLabel: {
    color: colors.primary,
    fontWeight: '800',
  },
  inactiveTabLabel: {
    color: '#64748B',
    fontWeight: '600',
  },
});

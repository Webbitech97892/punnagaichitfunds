import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, spacing, radius, typography, moderateScale } from '../theme';

export interface TabItem {
  title: string;
  icon?: (active: boolean) => ReactNode;
  badge?: string | number;
}

export interface SegmentedTabBarProps {
  tabs: (string | TabItem)[];
  selectedIndex?: number;
  onTabChange: (index: number) => void;
  containerStyle?: ViewStyle;
}

export default function SegmentedTabBar({
  tabs = [],
  selectedIndex = 0,
  onTabChange,
  containerStyle,
}: SegmentedTabBarProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {tabs.map((tab, index) => {
        const isSelected = selectedIndex === index;
        const tabTitle = typeof tab === 'string' ? tab : tab.title;
        const tabIcon = typeof tab === 'object' && tab.icon ? tab.icon : null;
        const tabBadge = typeof tab === 'object' ? tab.badge : null;

        return (
          <TouchableOpacity
            key={index}
            style={styles.tabButton}
            onPress={() => onTabChange(index)}
            activeOpacity={0.8}
          >
            {isSelected ? (
              <LinearGradient
                colors={colors.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.activePill}
              >
                {tabIcon ? <View style={styles.iconSlot}>{tabIcon(true)}</View> : null}
                <Text style={styles.activeTabText} numberOfLines={1}>
                  {tabTitle}
                </Text>
                {tabBadge !== undefined && tabBadge !== null ? (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>{tabBadge}</Text>
                  </View>
                ) : null}
              </LinearGradient>
            ) : (
              <View style={styles.inactivePill}>
                {tabIcon ? <View style={styles.iconSlot}>{tabIcon(false)}</View> : null}
                <Text style={styles.inactiveTabText} numberOfLines={1}>
                  {tabTitle}
                </Text>
                {tabBadge !== undefined && tabBadge !== null ? (
                  <View style={styles.inactiveBadge}>
                    <Text style={styles.inactiveBadgeText}>{tabBadge}</Text>
                  </View>
                ) : null}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.lg,
    padding: spacing.xxs + 1,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePill: {
    width: '100%',
    height: moderateScale(38),
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  inactivePill: {
    width: '100%',
    height: moderateScale(38),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  activeTabText: {
    ...typography.body,
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: colors.white,
  },
  inactiveTabText: {
    ...typography.body,
    fontSize: moderateScale(13),
    fontWeight: '500',
    color: colors.textSecondary,
  },
  iconSlot: {
    marginRight: spacing.xxs + 2,
  },
  activeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    marginLeft: spacing.xxs,
  },
  activeBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: colors.white,
  },
  inactiveBadge: {
    backgroundColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    marginLeft: spacing.xxs,
  },
  inactiveBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

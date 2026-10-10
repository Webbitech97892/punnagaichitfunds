import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, spacing, radius, typography, moderateScale } from '../theme';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  iconBgColor?: string;
  badgeText?: string;
  badgeType?: 'primary' | 'success' | 'warning' | 'info';
  onPress?: () => void;
  style?: ViewStyle;
  valueColor?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = colors.primaryLight,
  badgeText,
  badgeType = 'primary',
  onPress,
  style,
  valueColor = colors.textPrimary,
}: StatCardProps) {
  const getBadgeStyle = () => {
    switch (badgeType) {
      case 'success':
        return { bg: colors.successLight, text: colors.successText, border: colors.successBorder };
      case 'warning':
        return { bg: colors.warningLight, text: colors.warningText, border: colors.warningBorder };
      case 'info':
        return { bg: colors.infoLight, text: colors.infoText, border: colors.infoBorder };
      default:
        return { bg: colors.primaryLight, text: colors.primary, border: colors.borderBrand };
    }
  };

  const badgeTheme = getBadgeStyle();
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      <View style={styles.topRow}>
        {icon ? (
          <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
            {icon}
          </View>
        ) : null}

        {badgeText ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: badgeTheme.bg, borderColor: badgeTheme.border },
            ]}
          >
            <Text style={[styles.badgeText, { color: badgeTheme.text }]}>
              {badgeText}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.value, { color: valueColor }]} numberOfLines={1}>
          {value}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.2,
    borderColor: colors.border,
    padding: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  iconCircle: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 1,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: moderateScale(10),
  },
  content: {
    marginTop: spacing.xxs,
  },
  title: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  value: {
    ...typography.currency,
    fontSize: moderateScale(20),
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
});

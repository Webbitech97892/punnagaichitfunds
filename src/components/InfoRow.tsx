import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography, moderateScale } from '../theme';

export interface InfoRowProps {
  label: string;
  value?: string | number | null;
  icon?: ReactNode;
  showBorder?: boolean;
  valueColor?: string;
  isHighlight?: boolean;
  containerStyle?: ViewStyle;
}

export default function InfoRow({
  label,
  value,
  icon,
  showBorder = true,
  valueColor = colors.textPrimary,
  isHighlight = false,
  containerStyle,
}: InfoRowProps) {
  return (
    <View style={[styles.container, showBorder && styles.borderBottom, containerStyle]}>
      <View style={styles.left}>
        {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.right}>
        <Text
          style={[
            styles.value,
            { color: valueColor },
            isHighlight && styles.highlightValue,
          ]}
          numberOfLines={2}
        >
          {value || '-'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.45,
  },
  iconContainer: {
    marginRight: spacing.xs,
    width: moderateScale(22),
    alignItems: 'center',
  },
  label: {
    ...typography.body,
    fontSize: moderateScale(13),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  right: {
    flex: 0.55,
    alignItems: 'flex-end',
  },
  value: {
    ...typography.body,
    fontSize: moderateScale(13.5),
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  highlightValue: {
    fontWeight: '700',
    color: colors.primary,
  },
});

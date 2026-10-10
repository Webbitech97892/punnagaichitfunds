import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, moderateScale } from '../theme';
import CustomButton from './CustomButton';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  iconName?: string;
  actionTitle?: string;
  onAction?: () => void;
  containerStyle?: ViewStyle;
}

export default function EmptyState({
  title = 'No Records Found',
  message = 'There is currently no data available to display.',
  iconName = 'file-tray-outline',
  actionTitle,
  onAction,
  containerStyle,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.iconCircle}>
        <Ionicons name={iconName} size={moderateScale(36)} color={colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionTitle && onAction ? (
        <CustomButton
          title={actionTitle}
          onPress={onAction}
          variant="outline"
          height={moderateScale(40)}
          style={styles.actionBtn}
          textStyle={{ fontSize: moderateScale(13) }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: radius.full,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading,
    fontSize: moderateScale(16),
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.body,
    fontSize: moderateScale(13),
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: moderateScale(18),
    maxWidth: 280,
  },
  actionBtn: {
    marginTop: spacing.md,
    minWidth: 140,
  },
});

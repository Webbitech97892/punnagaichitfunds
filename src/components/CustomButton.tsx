import React, { ReactNode } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, spacing, radius, typography, moderateScale, Radius } from '../theme';

export interface CustomButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'gradient' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  gradientColors?: (string | number)[];
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  height?: number;
  rounded?: keyof Radius;
}

export default function CustomButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'gradient',
  gradientColors = colors.primaryGradient,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  height = moderateScale(48),
  rounded = 'md',
}: CustomButtonProps) {
  const borderRadius = radius[rounded] || radius.md;
  const isDisabled = disabled || loading;

  const renderContent = (contentColor: string) => (
    <View style={styles.innerRow}>
      {loading ? (
        <ActivityIndicator size="small" color={contentColor} style={styles.loader} />
      ) : (
        <>
          {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
          <Text style={[styles.text, { color: contentColor }, textStyle]}>
            {title}
          </Text>
          {rightIcon ? <View style={styles.rightIcon}>{rightIcon}</View> : null}
        </>
      )}
    </View>
  );

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={isDisabled}
        style={[styles.baseButton, { borderRadius }, style, isDisabled && styles.disabled]}
      >
        <LinearGradient
          colors={isDisabled ? ['#CBD5E1', '#94A3B8'] : gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { height, borderRadius }]}
        >
          {renderContent(colors.white)}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        disabled={isDisabled}
        style={[
          styles.baseButton,
          styles.outlineButton,
          { height, borderRadius },
          style,
          isDisabled && styles.disabledOutline,
        ]}
      >
        {renderContent(isDisabled ? colors.textMuted : colors.primary)}
      </TouchableOpacity>
    );
  }

  if (variant === 'danger') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={isDisabled}
        style={[
          styles.baseButton,
          styles.dangerButton,
          { height, borderRadius },
          style,
          isDisabled && styles.disabled,
        ]}
      >
        {renderContent(colors.white)}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.baseButton,
        styles.secondaryButton,
        { height, borderRadius },
        style,
        isDisabled && styles.disabled,
      ]}
    >
      {renderContent(colors.textPrimary)}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  secondaryButton: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  dangerButton: {
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.buttonPrimary,
    fontSize: moderateScale(14),
    fontWeight: '700',
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: spacing.xs,
  },
  rightIcon: {
    marginLeft: spacing.xs,
  },
  loader: {
    marginHorizontal: spacing.xs,
  },
  disabled: {
    opacity: 0.6,
  },
  disabledOutline: {
    borderColor: colors.border,
  },
});

import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors, spacing, radius, typography, moderateScale } from '../theme';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  rightContent?: ReactNode;
  variant?: 'gradient' | 'light' | 'clean';
  titleColor?: string;
}

export default function Header({
  title,
  subtitle,
  onBack,
  showBack = false,
  rightContent,
  variant = 'gradient',
  titleColor,
}: HeaderProps) {
  const isLight = variant === 'light' || variant === 'clean';
  const textColor = titleColor || (isLight ? colors.textPrimary : colors.white);
  const subtitleColor = isLight ? colors.textSecondary : 'rgba(255,255,255,0.85)';
  const iconColor = isLight ? colors.textPrimary : colors.white;

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBack && onBack ? (
          <TouchableOpacity
            style={[
              styles.backButton,
              isLight ? styles.backButtonLight : styles.backButtonGradient,
            ]}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <AntDesign name="arrowleft" size={moderateScale(20)} color={iconColor} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <View style={styles.titleContainer}>
        {title ? (
          <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={[styles.subtitle, { color: subtitleColor }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightSection}>
        {rightContent ? rightContent : <View style={styles.placeholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: moderateScale(56),
  },
  leftSection: {
    width: moderateScale(42),
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  backButton: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonGradient: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonLight: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  title: {
    ...typography.heading,
    fontSize: moderateScale(17),
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    ...typography.caption,
    fontSize: moderateScale(11),
    marginTop: 1,
    textAlign: 'center',
  },
  rightSection: {
    width: moderateScale(42),
    justifyContent: 'center',
    alignItems: 'flex-end',
    zIndex: 2,
  },
  placeholder: {
    width: moderateScale(38),
  },
});



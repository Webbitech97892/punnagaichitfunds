import React, { ReactNode } from 'react';
import {
  StyleSheet,
  StatusBar,
  View,
  ViewStyle,
  StatusBarStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import { colors, spacing } from '../theme';

export interface GradientScreenWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  rightContent?: ReactNode;
  useGradientHeader?: boolean;
  gradientColors?: (string | number)[];
  statusBarStyle?: StatusBarStyle;
  contentStyle?: ViewStyle;
  headerVariant?: 'gradient' | 'light' | 'clean';
  customHeader?: ReactNode;
}

export default function GradientScreenWrapper({
  children,
  title,
  subtitle,
  onBack,
  showBack = false,
  rightContent,
  useGradientHeader = true,
  gradientColors = colors.primaryGradient,
  statusBarStyle = 'light-content',
  contentStyle,
  headerVariant = 'gradient',
  customHeader,
}: GradientScreenWrapperProps) {
  const insets = useSafeAreaInsets();
  const isGradient = useGradientHeader && headerVariant === 'gradient';
  const topHeaderColor = isGradient
    ? String(gradientColors[0]) || colors.primaryDark
    : headerVariant === 'light' || headerVariant === 'clean'
    ? colors.white
    : colors.primaryDark;
  const computedBarStyle: StatusBarStyle = isGradient
    ? 'light-content'
    : headerVariant === 'light' || headerVariant === 'clean'
    ? 'dark-content'
    : statusBarStyle;

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={computedBarStyle}
        backgroundColor="transparent"
        animated={true}
        translucent={true}
      />

      {isGradient ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradientHeader, { paddingTop: insets.top }]}
        >
          {customHeader ? (
            customHeader
          ) : (
            <Header
              title={title}
              subtitle={subtitle}
              onBack={onBack}
              showBack={showBack}
              rightContent={rightContent}
              variant="gradient"
            />
          )}
        </LinearGradient>
      ) : customHeader ? (
        <View style={{ paddingTop: insets.top, backgroundColor: topHeaderColor }}>
          {customHeader}
        </View>
      ) : title ? (
        <View style={{ paddingTop: insets.top, backgroundColor: topHeaderColor }}>
          <Header
            title={title}
            subtitle={subtitle}
            onBack={onBack}
            showBack={showBack}
            rightContent={rightContent}
            variant={headerVariant}
          />
        </View>
      ) : null}

      <View style={[styles.content, contentStyle, { paddingBottom: insets.bottom }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradientHeader: {
    paddingBottom: spacing.xs,
  },
  content: {
    flex: 1,
  },
});


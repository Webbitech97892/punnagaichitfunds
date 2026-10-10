import { TextStyle } from 'react-native';
import { colors } from './colors';
import { fontScale } from './responsive';

export interface Typography {
  screenTitle: TextStyle;
  sectionTitle: TextStyle;
  heading: TextStyle;
  bodyLarge: TextStyle;
  body: TextStyle;
  bodySmall: TextStyle;
  caption: TextStyle;
  buttonPrimary: TextStyle;
  buttonSecondary: TextStyle;
  link: TextStyle;
  currency: TextStyle;
}

export const typography: Typography = {
  screenTitle: {
    fontSize: fontScale(24),
    fontWeight: '700',
    lineHeight: fontScale(30),
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: fontScale(18),
    fontWeight: '700',
    lineHeight: fontScale(24),
    color: colors.textPrimary,
  },
  heading: {
    fontSize: fontScale(16),
    fontWeight: '600',
    lineHeight: fontScale(22),
    color: colors.textPrimary,
  },
  bodyLarge: {
    fontSize: fontScale(15),
    fontWeight: '500',
    lineHeight: fontScale(22),
    color: colors.textPrimary,
  },
  body: {
    fontSize: fontScale(13.5),
    fontWeight: '400',
    lineHeight: fontScale(20),
    color: colors.textSecondary,
  },
  bodySmall: {
    fontSize: fontScale(12),
    fontWeight: '400',
    lineHeight: fontScale(16),
    color: colors.textMuted,
  },
  caption: {
    fontSize: fontScale(11),
    fontWeight: '500',
    lineHeight: fontScale(15),
    color: colors.textMuted,
  },
  buttonPrimary: {
    fontSize: fontScale(15),
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  buttonSecondary: {
    fontSize: fontScale(14),
    fontWeight: '600',
    color: colors.textPrimary,
  },
  link: {
    fontSize: fontScale(13.5),
    fontWeight: '600',
    color: colors.primary,
  },
  currency: {
    fontSize: fontScale(18),
    fontWeight: '700',
    color: colors.textPrimary,
  },
};

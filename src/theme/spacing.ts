import { moderateScale } from './responsive';

export const spacing = {
  none: 0,
  xxs: moderateScale(2),
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(16),
  lg: moderateScale(24),
  xl: moderateScale(32),
  xxl: moderateScale(40),
  xxxl: moderateScale(48),
} as const;

export type Spacing = typeof spacing;

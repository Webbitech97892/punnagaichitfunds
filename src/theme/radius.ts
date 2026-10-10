import { moderateScale } from './responsive';

export const radius = {
  none: 0,
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(24),
  xxl: moderateScale(32),
  full: 999,
} as const;

export type Radius = typeof radius;

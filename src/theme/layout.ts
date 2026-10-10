import { useWindowDimensions } from 'react-native';

export interface ResponsiveLayout {
  width: number;
  height: number;
  isPortrait: boolean;
  isTablet: boolean;
}

export const useResponsive = (): ResponsiveLayout => {
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;
  const isTablet = width >= 768;

  return {
    width,
    height,
    isPortrait,
    isTablet,
  };
};

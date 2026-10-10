import { Dimensions, ScaledSize } from 'react-native';

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const getScreenSize = (): ScaledSize => {
  return Dimensions.get('window');
};

export const scale = (size: number): number => {
  const { width } = getScreenSize();
  return (width / guidelineBaseWidth) * size;
};

export const verticalScale = (size: number): number => {
  const { height } = getScreenSize();
  return (height / guidelineBaseHeight) * size;
};

export const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

export const fontScale = (size: number): number => moderateScale(size);

export const screenWidth = (): number => getScreenSize().width;
export const screenHeight = (): number => getScreenSize().height;
export const isSmallDevice = (): boolean => screenWidth() < 375;
export const isTablet = (): boolean => screenWidth() >= 768;

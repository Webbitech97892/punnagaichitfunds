import React, { useState, ReactNode } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, moderateScale } from '../theme';

export interface CustomInputProps {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  iconName?: string;
  iconColor?: string;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  editable?: boolean;
  rightComponent?: ReactNode;
  multiline?: boolean;
  onPress?: () => void;
}

export default function CustomInput({
  label,
  value,
  onChangeText,
  placeholder,
  placeholderTextColor = colors.textMuted,
  iconName,
  iconColor = colors.primary,
  secureTextEntry = false,
  error,
  keyboardType = 'default',
  autoCapitalize = 'none',
  maxLength,
  containerStyle,
  inputStyle,
  editable = true,
  rightComponent,
  multiline = false,
  onPress,
}: CustomInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const showEyeIcon = secureTextEntry;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TouchableOpacity
        activeOpacity={onPress ? 0.7 : 1}
        onPress={onPress}
        disabled={!onPress}
        style={[
          styles.inputContainer,
          isFocused ? styles.inputFocused : null,
          error ? styles.inputError : null,
          !editable ? styles.inputDisabled : null,
        ]}
      >
        {iconName ? (
          <View style={styles.leftIconContainer}>
            <Ionicons name={iconName} size={moderateScale(20)} color={error ? colors.error : iconColor} />
          </View>
        ) : null}

        <TextInput
          style={[
            styles.input,
            iconName ? styles.inputWithIcon : null,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          editable={editable && !onPress}
          multiline={multiline}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {showEyeIcon ? (
          <TouchableOpacity
            style={styles.rightAction}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={moderateScale(20)}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ) : rightComponent ? (
          <View style={styles.rightAction}>{rightComponent}</View>
        ) : null}
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.2,
    borderColor: colors.border,
    borderRadius: radius.md,
    height: moderateScale(48),
    paddingHorizontal: spacing.sm,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  inputDisabled: {
    backgroundColor: colors.surfaceVariant,
    borderColor: colors.borderLight,
  },
  leftIconContainer: {
    marginRight: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    width: moderateScale(28),
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.textPrimary,
    fontSize: moderateScale(14),
    fontWeight: '500',
    paddingVertical: 0,
  },
  inputWithIcon: {
    paddingLeft: spacing.xs,
  },
  rightAction: {
    paddingHorizontal: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xxs,
    marginLeft: spacing.xxs,
  },
});

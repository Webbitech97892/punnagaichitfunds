import React from 'react';
import {
  Modal,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { colors, spacing, radius, typography, moderateScale } from '../theme';

export interface LoadingModalProps {
  visible: boolean;
  message?: string;
  submessage?: string;
}

export default function LoadingModal({
  visible,
  message = 'Please Wait...',
  submessage = 'Processing your request',
}: LoadingModalProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
          <Text style={styles.message}>{message}</Text>
          {submessage ? <Text style={styles.submessage}>{submessage}</Text> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    maxWidth: 320,
    borderWidth: 1.2,
    borderColor: colors.border,
  },
  spinnerContainer: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  message: {
    ...typography.heading,
    fontSize: moderateScale(16),
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '700',
  },
  submessage: {
    ...typography.caption,
    fontSize: moderateScale(12),
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

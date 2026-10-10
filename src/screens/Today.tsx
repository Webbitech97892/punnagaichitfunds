import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { todayEarnings } from '../services/apiService';
import { formatCurrency } from '../utils/currency';
import { getDisplayToday, formatDateDMY } from '../utils/date';
import { LoadingModal, EmptyState } from '../components';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, typography, moderateScale } from '../theme';
import { TransactionItem } from '../types';

interface TodayProps {
  name?: string;
}

export default function Today({ name }: TodayProps) {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<string | number>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTodayData = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setIsLoading(true);
    }
    try {
      const response = await todayEarnings();
      if (response) {
        setTotalAmount(response.total_earnings || '0');
        setTransactions(response.individual_earnings || []);
      } else {
        setTransactions([]);
        setTotalAmount('0');
      }
    } catch (error) {
      console.error('[Today] Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTodayData(false);
    }, [fetchTodayData])
  );

  useEffect(() => {
    fetchTodayData(true);
  }, [fetchTodayData, name]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTodayData(false);
  };

  const renderItem: ListRenderItem<TransactionItem> = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={styles.cardLeft}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {item.name ? item.name.charAt(0).toUpperCase() : 'C'}
          </Text>
        </View>
        <View style={styles.textCol}>
          <Text style={styles.customerName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.metaRow}>
            {item.id ? (
              <View style={styles.idBadge}>
                <Text style={styles.idText}>ID: {item.id}</Text>
              </View>
            ) : null}
            {item.date ? (
              <View style={styles.dateBadge}>
                <Ionicons name="time-outline" size={moderateScale(10)} color={colors.textMuted} />
                <Text style={styles.dateText}>{formatDateDMY(item.date)}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.cardRight}>
        <Text style={styles.amountText}>{formatCurrency(item.amount)}</Text>
        <View style={styles.statusPill}>
          <Ionicons name="checkmark-circle" size={moderateScale(10)} color={colors.success} />
          <Text style={styles.statusText}>Paid</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top Total Summary Widget */}
      <View style={styles.totalWidget}>
        <View style={styles.totalWidgetHeader}>
          <View style={styles.totalLabelRow}>
            <View style={styles.liveDot} />
            <Text style={styles.totalLabel}>TODAY'S COLLECTIONS</Text>
          </View>
          <Text style={styles.todayDateText}>{getDisplayToday()}</Text>
        </View>

        <View style={styles.totalAmountRow}>
          <Text style={styles.totalAmountValue}>{formatCurrency(totalAmount)}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {transactions.length} {transactions.length === 1 ? 'Entry' : 'Entries'}
            </Text>
          </View>
        </View>
      </View>

      {/* Transactions List */}
      <FlatList
        data={transactions}
        keyExtractor={(item, index) => String(item.id || index)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title="No Collections Today"
              message="You haven't recorded any payments yet today. New collections will appear here in real-time."
              iconName="receipt-outline"
            />
          ) : null
        }
      />

      <LoadingModal visible={isLoading && !refreshing} message="Loading Today's Summary..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  totalWidget: {
    borderRadius: radius.lg,
    borderWidth: 1.2,
    borderColor: '#FED7AA',
    backgroundColor: '#FFF7ED',
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    padding: spacing.md,
  },
  totalWidgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxs,
  },
  totalLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: moderateScale(7),
    height: moderateScale(7),
    borderRadius: radius.full,
    backgroundColor: colors.success,
    marginRight: spacing.xxs + 2,
  },
  totalLabel: {
    ...typography.caption,
    fontSize: moderateScale(10.5),
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  todayDateText: {
    ...typography.caption,
    fontSize: moderateScale(11),
    color: colors.textSecondary,
    fontWeight: '600',
  },
  totalAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: spacing.xxs,
  },
  totalAmountValue: {
    ...typography.currency,
    fontSize: moderateScale(24),
    fontWeight: '800',
    color: colors.textPrimary,
  },
  countBadge: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  countBadgeText: {
    ...typography.caption,
    fontSize: moderateScale(10.5),
    fontWeight: '700',
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.68,
  },
  avatarCircle: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: radius.full,
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: colors.successBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    ...typography.heading,
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: colors.successText,
  },
  textCol: {
    flex: 1,
  },
  customerName: {
    ...typography.heading,
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xxs,
  },
  idBadge: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.xs,
    marginRight: spacing.xs,
  },
  idText: {
    ...typography.caption,
    fontSize: moderateScale(10),
    color: colors.textSecondary,
    fontWeight: '600',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    ...typography.caption,
    fontSize: moderateScale(10),
    color: colors.textMuted,
    marginLeft: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
    flex: 0.32,
  },
  amountText: {
    ...typography.currency,
    fontSize: moderateScale(15),
    fontWeight: '800',
    color: colors.successText,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.full,
    marginTop: spacing.xxs,
  },
  statusText: {
    ...typography.caption,
    fontSize: moderateScale(9.5),
    fontWeight: '700',
    color: colors.successText,
    marginLeft: 2,
  },
});

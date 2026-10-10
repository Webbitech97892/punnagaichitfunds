import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ListRenderItem,
  RefreshControl,
  Platform,
  Keyboard,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { history } from '../services/apiService';
import { formatCurrency } from '../utils/currency';
import { formatDateYMD, formatDateDMY } from '../utils/date';
import { CustomButton, LoadingModal, EmptyState } from '../components';
import { colors, spacing, radius, typography, moderateScale } from '../theme';
import { TransactionItem } from '../types';

interface HistoryProps {
  name?: string;
}

export default function History({ name: _name }: HistoryProps) {
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [fromDateStr, setFromDateStr] = useState('');
  const [toDateStr, setToDateStr] = useState('');
  const [activePicker, setActivePicker] = useState<'from' | 'to' | null>(null);
  const [records, setRecords] = useState<TransactionItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const openDatePicker = (type: 'from' | 'to') => {
    Keyboard.dismiss();
    if (Platform.OS === 'android') {
      const currentDate = type === 'from' ? fromDate : toDate < fromDate ? fromDate : toDate;
      const minDate = type === 'to' && fromDateStr ? fromDate : undefined;

      DateTimePickerAndroid.open({
        value: currentDate,
        mode: 'date',
        is24Hour: true,
        minimumDate: minDate,
        onChange: (event: DateTimePickerEvent, selectedDate?: Date) => {
          if (event.type === 'set' && selectedDate) {
            if (type === 'from') {
              setFromDate(selectedDate);
              setFromDateStr(formatDateYMD(selectedDate));
              if (toDateStr && selectedDate > toDate) {
                setToDate(selectedDate);
                setToDateStr(formatDateYMD(selectedDate));
              }
            } else if (type === 'to') {
              if (fromDateStr && selectedDate < fromDate) {
                setToDate(fromDate);
                setToDateStr(formatDateYMD(fromDate));
              } else {
                setToDate(selectedDate);
                setToDateStr(formatDateYMD(selectedDate));
              }
            }
          }
        },
      });
    } else {
      setActivePicker(type);
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      if (activePicker === 'from') {
        setFromDate(selectedDate);
        setFromDateStr(formatDateYMD(selectedDate));
        if (toDateStr && selectedDate > toDate) {
          setToDate(selectedDate);
          setToDateStr(formatDateYMD(selectedDate));
        }
      } else if (activePicker === 'to') {
        if (fromDateStr && selectedDate < fromDate) {
          setToDate(fromDate);
          setToDateStr(formatDateYMD(fromDate));
        } else {
          setToDate(selectedDate);
          setToDateStr(formatDateYMD(selectedDate));
        }
      }
    }
    setActivePicker(null);
  };

  const handleSearch = async (showLoader = true) => {
    if (!fromDateStr || !toDateStr) {
      if (showLoader) {
        Alert.alert('Selection Required', 'Please select both From Date and To Date to filter records.');
      }
      return;
    }

    if (showLoader) {
      setIsLoading(true);
    }
    try {
      const data = await history({ from: fromDateStr, to: toDateStr });
      setRecords(Array.isArray(data) ? data : []);
      setHasSearched(true);
    } catch (e) {
      console.error('[History] Filter error:', e);
      if (showLoader) {
        Alert.alert('Error', 'Unable to fetch historical records. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (fromDateStr && toDateStr) {
      await handleSearch(false);
    } else {
      setRefreshing(false);
    }
  };

  const calculateTotal = (): number => {
    return records.reduce((sum, item) => {
      const amt = parseFloat(String(item.amount || '0').replace(/[^0-9.-]+/g, '')) || 0;
      return sum + amt;
    }, 0);
  };

  const renderItem: ListRenderItem<TransactionItem> = ({ item }) => (
    <View style={styles.recordCard}>
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
                <Ionicons name="calendar-outline" size={moderateScale(10)} color={colors.textMuted} />
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
      {/* Date Filter Selection Card */}
      <View style={styles.filterCard}>
        <Text style={styles.filterTitle}>Date Range Filter</Text>

        <View style={styles.dateSelectorsRow}>
          {/* From Date Picker */}
          <View style={styles.dateSelectorCol}>
            <Text style={styles.dateLabel}>FROM DATE</Text>
            <TouchableOpacity
              style={[styles.dateButton, fromDateStr ? styles.dateButtonActive : null]}
              onPress={() => openDatePicker('from')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="calendar-outline"
                size={moderateScale(16)}
                color={fromDateStr ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.dateButtonText, fromDateStr ? styles.dateTextFilled : null]}>
                {fromDateStr ? formatDateDMY(fromDateStr) : 'Select date'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* To Date Picker */}
          <View style={styles.dateSelectorCol}>
            <Text style={styles.dateLabel}>TO DATE</Text>
            <TouchableOpacity
              style={[styles.dateButton, toDateStr ? styles.dateButtonActive : null]}
              onPress={() => openDatePicker('to')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="calendar-outline"
                size={moderateScale(16)}
                color={toDateStr ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.dateButtonText, toDateStr ? styles.dateTextFilled : null]}>
                {toDateStr ? formatDateDMY(toDateStr) : 'Select date'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <CustomButton
          title="FILTER RECORDS"
          onPress={handleSearch}
          loading={isLoading}
          height={moderateScale(46)}
          style={styles.filterBtn}
          leftIcon={<Ionicons name="filter" size={moderateScale(16)} color={colors.white} />}
        />
      </View>

      {/* Date Picker Modal (for iOS fallback) */}
      {Platform.OS !== 'android' && activePicker && (
        <DateTimePicker
          value={activePicker === 'from' ? fromDate : toDate < fromDate ? fromDate : toDate}
          mode="date"
          display="default"
          minimumDate={activePicker === 'to' && fromDateStr ? fromDate : undefined}
          onChange={handleDateChange}
        />
      )}

      {/* Results Header */}
      {hasSearched && records.length > 0 ? (
        <View style={styles.resultsSummaryBar}>
          <Text style={styles.resultsCount}>
            Found {records.length} {records.length === 1 ? 'Record' : 'Records'}
          </Text>
          <Text style={styles.resultsTotal}>
            Total: {formatCurrency(calculateTotal())}
          </Text>
        </View>
      ) : null}

      {/* Record List */}
      <FlatList
        data={records}
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
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title={hasSearched ? 'No Records Found' : 'Filter by Date Range'}
              message={
                hasSearched
                  ? 'No collection transactions were found for the selected date range.'
                  : 'Select From Date and To Date above, then tap "Filter Records" to view history.'
              }
              iconName="calendar-clear-outline"
            />
          ) : null
        }
      />

      <LoadingModal visible={isLoading} message="Filtering Records..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.2,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  filterTitle: {
    ...typography.heading,
    fontSize: moderateScale(14.5),
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  dateSelectorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  dateSelectorCol: {
    flex: 0.485,
  },
  dateLabel: {
    ...typography.caption,
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.xxs,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1.1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    height: moderateScale(42),
  },
  dateButtonActive: {
    borderColor: colors.borderBrand,
    backgroundColor: colors.surface,
  },
  dateButtonText: {
    ...typography.body,
    fontSize: moderateScale(12.5),
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  dateTextFilled: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  filterBtn: {
    marginTop: spacing.xxs,
  },
  resultsSummaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  resultsCount: {
    ...typography.caption,
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: colors.textSecondary,
  },
  resultsTotal: {
    ...typography.body,
    fontSize: moderateScale(13),
    fontWeight: '800',
    color: colors.successText,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  recordCard: {
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
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.borderBrand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    ...typography.heading,
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: colors.primary,
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

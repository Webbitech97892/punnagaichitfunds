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
import { dateWiseHistory } from '../services/apiService';
import { formatCurrency } from '../utils/currency';
import { formatDateYMD, formatDateDMY } from '../utils/date';
import { CustomInput, CustomButton, LoadingModal, EmptyState } from '../components';
import { colors, spacing, radius, typography, moderateScale } from '../theme';
import { TransactionItem } from '../types';

interface CustomerProps {
  name?: string;
}

export default function Customer({ name: _name }: CustomerProps) {
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [fromDateStr, setFromDateStr] = useState('');
  const [toDateStr, setToDateStr] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [activePicker, setActivePicker] = useState<'from' | 'to' | null>(null);
  const [customerRecords, setCustomerRecords] = useState<TransactionItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mobileError, setMobileError] = useState('');

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
    if (!mobileNumber.trim()) {
      if (showLoader) {
        setMobileError('Customer Mobile number is required');
      }
      return;
    }
    setMobileError('');

    if (!fromDateStr || !toDateStr) {
      if (showLoader) {
        Alert.alert('Date Range Required', 'Please select both From Date and To Date.');
      }
      return;
    }

    if (showLoader) {
      setIsLoading(true);
    }
    try {
      const records = await dateWiseHistory({
        from: fromDateStr,
        to: toDateStr,
        number: mobileNumber.trim(),
      });

      if (Array.isArray(records) && records.length > 0) {
        setCustomerRecords(records);
        setHasSearched(true);
      } else {
        setCustomerRecords([]);
        setHasSearched(true);
        if (showLoader) {
          Alert.alert('No Records', 'No collections found for this mobile number in selected dates.');
        }
      }
    } catch (e) {
      console.error('[Customer] Search error:', e);
      if (showLoader) {
        Alert.alert('Error', 'Unable to fetch customer history.');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (mobileNumber.trim() && fromDateStr && toDateStr) {
      await handleSearch(false);
    } else {
      setRefreshing(false);
    }
  };

  const calculateTotal = (): number => {
    return customerRecords.reduce((sum, item) => {
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
      {/* Search & Filter Form Card */}
      <View style={styles.filterCard}>
        <Text style={styles.filterTitle}>Customer Search & Date Filter</Text>

        <CustomInput
          label="Customer Mobile Number"
          value={mobileNumber}
          onChangeText={(text) => {
            setMobileNumber(text);
            if (mobileError) {
              setMobileError('');
            }
          }}
          placeholder="Enter 10-digit mobile number"
          iconName="call-outline"
          keyboardType="phone-pad"
          maxLength={10}
          error={mobileError}
          containerStyle={{ marginBottom: spacing.sm }}
        />

        <View style={styles.dateSelectorsRow}>
          {/* From Date */}
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

          {/* To Date */}
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
          title="SEARCH CUSTOMER HISTORY"
          onPress={handleSearch}
          loading={isLoading}
          height={moderateScale(46)}
          style={styles.searchBtn}
          leftIcon={<Ionicons name="search" size={moderateScale(16)} color={colors.white} />}
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
      {hasSearched && customerRecords.length > 0 ? (
        <View style={styles.resultsSummaryBar}>
          <View>
            <Text style={styles.resultsCount}>
              Found {customerRecords.length} {customerRecords.length === 1 ? 'Record' : 'Records'}
            </Text>
            <Text style={styles.resultsTotalText}>
              Total: <Text style={styles.resultsTotalAmount}>{formatCurrency(calculateTotal())}</Text>
            </Text>
          </View>
          <View style={styles.liveChip}>
            <Text style={styles.liveChipText}>Customer History</Text>
          </View>
        </View>
      ) : null}

      {/* Record List */}
      <FlatList
        data={customerRecords}
        keyExtractor={(item, index) => `${item.id || 'cust'}_${item.date || ''}_${index}`}
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
              title={hasSearched ? 'No Customer Records' : 'Search Customer History'}
              message={
                hasSearched
                  ? 'No collection records found for this customer in the selected date range.'
                  : 'Enter customer mobile number and select dates above to view history.'
              }
              iconName="person-outline"
            />
          ) : null
        }
      />

      <LoadingModal visible={isLoading} message="Searching History..." />
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
  searchBtn: {
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
  resultsTotalText: {
    ...typography.caption,
    fontSize: moderateScale(11.5),
    color: colors.textSecondary,
    marginTop: 2,
  },
  resultsTotalAmount: {
    fontWeight: '800',
    color: colors.successText,
  },
  liveChip: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  liveChipText: {
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

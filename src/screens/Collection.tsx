import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { searchCustomer, payment } from '../services/apiService';
import { StorageService } from '../constants/StorageService';
import { formatCurrency, parseAmount } from '../utils/currency';
import { formatDateDMY } from '../utils/date';
import {
  GradientScreenWrapper,
  CustomInput,
  CustomButton,
  InfoRow,
  LoadingModal,
  EmptyState,
} from '../components';
import { colors, spacing, radius, typography, moderateScale } from '../theme';
import { CustomerData, RootStackParamList } from '../types';

interface CollectionProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Collection'>;
}

export default function Collection({ navigation }: CollectionProps) {
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [agentName, setAgentName] = useState('');
  const [agentMobile, setAgentMobile] = useState('');
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [searchResults, setSearchResults] = useState<CustomerData[]>([]);
  const [isLiveSearching, setIsLiveSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Fetching Details...');
  const [refreshing, setRefreshing] = useState(false);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadAgentDetails = async () => {
    const name = await StorageService.getUserName();
    const phone = await StorageService.getUserMobile();
    if (name) {
      setAgentName(name);
    }
    if (phone) {
      setAgentMobile(phone);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAgentDetails();
    }, [])
  );

  useEffect(() => {
    if (customerData) {
      console.log('Chit Plan Information (customerData):', JSON.stringify(customerData, null, 2));
    }
  }, [customerData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAgentDetails();
    if (customerId.trim()) {
      try {
        const response = await searchCustomer(customerId.trim());
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            if (response.data.length > 0) {
              setCustomerData(response.data[0]);
            }
          } else if (typeof response.data === 'object' && (response.data as CustomerData).name) {
            setCustomerData(response.data as CustomerData);
          }
        }
      } catch (err) {
        console.error('[Collection] Refresh error:', err);
      }
    }
    setRefreshing(false);
  };

  const handleInputChange = (text: string) => {
    setCustomerId(text);
    if (searchError) {
      setSearchError('');
    }

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    const query = text.trim();
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsLiveSearching(false);
      return;
    }

    setIsLiveSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const response = await searchCustomer(query);
        setIsLiveSearching(false);
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            setSearchResults(response.data);
            setShowDropdown(response.data.length > 0);
          } else if (typeof response.data === 'object' && (response.data as CustomerData).name) {
            setSearchResults([response.data as CustomerData]);
            setShowDropdown(true);
          } else {
            setSearchResults([]);
            setShowDropdown(false);
          }
        } else {
          setSearchResults([]);
          setShowDropdown(false);
        }
      } catch (err) {
        setIsLiveSearching(false);
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);
  };

  const handleSelectCustomer = (item: CustomerData) => {
    setCustomerData(item);
    setCustomerId(item.chit_groupcode || item.chit_custid || item.name || '');
    setShowDropdown(false);
    setSearchResults([]);
    setAmount('');
    setAmountError('');
    setSearchError('');
    Keyboard.dismiss();
  };

  const handleSearch = async () => {
    if (!customerId.trim()) {
      setSearchError('Please enter Customer ID or Chit ID');
      return;
    }
    setSearchError('');
    setLoadingText('Searching Customer...');
    setIsLoading(true);
    setShowDropdown(false);

    try {
      const response = await searchCustomer(customerId.trim());
      setIsLoading(false);

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          if (response.data.length === 1) {
            setCustomerData(response.data[0]);
            setAmount('');
            setAmountError('');
          } else if (response.data.length > 1) {
            setSearchResults(response.data);
            setShowDropdown(true);
          } else {
            setCustomerData(null);
            Alert.alert('Not Found', 'No customer record found with this ID or Chit code.');
          }
        } else if (typeof response.data === 'object' && (response.data as CustomerData).name) {
          setCustomerData(response.data as CustomerData);
          setAmount('');
          setAmountError('');
        } else {
          setCustomerData(null);
          Alert.alert('Not Found', 'No customer record found with this ID or Chit code.');
        }
      } else {
        setCustomerData(null);
        Alert.alert('Not Found', response?.message || 'No customer record found with this ID. Please verify and try again.');
      }
    } catch (e) {
      setIsLoading(false);
      Alert.alert('Error', 'Unable to fetch customer data. Please try again.');
    }
  };

  const handlePayNow = async () => {
    if (!customerData) {
      Alert.alert('Attention', 'Please search and select a customer first.');
      return;
    }

    const numericAmount = parseAmount(amount);
    if (!numericAmount || numericAmount <= 0) {
      setAmountError('Please enter a valid collection amount.');
      return;
    }
    setAmountError('');

    Alert.alert(
      'Confirm Collection',
      `Collect ${formatCurrency(numericAmount)} from ${customerData.name || 'Customer'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Collect',
          onPress: async () => {
            setLoadingText('Processing Payment...');
            setIsLoading(true);
            try {
              const res = await payment(customerData, numericAmount);
              setIsLoading(false);
              if (res) {
                // Immediately update customerData with payment response data so UI refreshes right away
                if (res.data) {
                  const returnedData = res.data as Partial<CustomerData>;
                  setCustomerData((prev) => {
                    if (!prev) return res.data as CustomerData;
                    return {
                      ...prev,
                      ...returnedData,
                      name: returnedData.name || prev.name,
                      mobile: returnedData.mobile || prev.mobile,
                      group_name: returnedData.group_name || prev.group_name,
                      chit_started_date: returnedData.chit_started_date || prev.chit_started_date,
                      chit_plan: returnedData.chit_plan !== undefined ? returnedData.chit_plan : prev.chit_plan,
                      total_paid_amount:
                        returnedData.total_paid_amount !== undefined
                          ? returnedData.total_paid_amount
                          : prev.total_paid_amount,
                      pending_amount:
                        returnedData.pending_amount !== undefined
                          ? returnedData.pending_amount
                          : prev.pending_amount,
                      next_chit_date:
                        returnedData.next_chit_date !== undefined && returnedData.next_chit_date !== null
                          ? returnedData.next_chit_date
                          : prev.next_chit_date,
                      last_payment_date: returnedData.last_payment_date || prev.last_payment_date,
                    };
                  });
                }
                setAmount('');
                setAmountError('');

                Alert.alert(
                  'Success',
                  res.message || 'Payment collected successfully!',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Background fetch to ensure all server-calculated fields are fully synced
                        const lookupKey = customerId.trim() || String(customerData.chit_custid || '');
                        if (lookupKey) {
                          searchCustomer(lookupKey)
                            .then((fresh) => {
                              if (fresh && fresh.data) {
                                if (Array.isArray(fresh.data)) {
                                  if (fresh.data.length > 0) {
                                    setCustomerData(fresh.data[0]);
                                  }
                                } else {
                                  setCustomerData(fresh.data);
                                }
                              }
                            })
                            .catch(() => {});
                        }
                      },
                    },
                  ]
                );
              }
            } catch (err) {
              setIsLoading(false);
              Alert.alert('Payment Failed', 'Payment collection could not be completed.');
            }
          },
        },
      ]
    );
  };

  const handleQuickAmount = (val: string | number) => {
    setAmount(String(val));
    if (amountError) {
      setAmountError('');
    }
  };

  return (
    <GradientScreenWrapper
      title="Chit Collection"
      subtitle={agentName ? `Agent: ${agentName}` : 'Field Collection'}
      showBack={false}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex1}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
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
        >
          {/* Agent Info Chip Bar */}
          <View style={styles.agentBar}>
            <View style={styles.agentInfoCol}>
              <Text style={styles.agentLabel}>COLLECTING AGENT</Text>
              <Text style={styles.agentValue}>{agentName || 'Field Agent'}</Text>
            </View>
            {agentMobile ? (
              <View style={styles.agentPhoneBadge}>
                <Ionicons name="call" size={moderateScale(12)} color={colors.primary} />
                <Text style={styles.agentPhoneText}>{agentMobile}</Text>
              </View>
            ) : null}
          </View>

          {/* Search Customer Card */}
          <View style={styles.searchCard}>
            <Text style={styles.cardSectionTitle}>Search Customer</Text>
            <Text style={styles.cardSectionSubtitle}>Enter Chit Group Code (e.g. AVA1L02583), Customer ID</Text>

            <View style={styles.searchRow}>
              <View style={styles.searchInputWrapper}>
                <CustomInput
                  value={customerId}
                  onChangeText={handleInputChange}
                  placeholder="e.g. AVA1L02583,807"
                  iconName="search-outline"
                  error={searchError}
                  autoCapitalize="none"
                  containerStyle={styles.noMarginBottom}
                />
              </View>
              <CustomButton
                title="Search"
                onPress={handleSearch}
                height={moderateScale(48)}
                style={styles.searchBtn}
                textStyle={{ fontSize: moderateScale(13) }}
              />
            </View>

            {/* Live Search Loading Indicator */}
            {isLiveSearching && (
              <View style={styles.liveSearchRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.liveSearchText}>Searching matching customers...</Text>
              </View>
            )}

            {/* Live Search Results Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <View style={styles.dropdownContainer}>
                <View style={styles.dropdownHeader}>
                  <View style={styles.dropdownTitleRow}>
                    <Ionicons name="list" size={moderateScale(14)} color={colors.primary} />
                    <Text style={styles.dropdownHeaderText}>
                      {searchResults.length} {searchResults.length === 1 ? 'Matching Customer' : 'Matching Customers'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowDropdown(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={moderateScale(16)} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {searchResults.map((item, index) => (
                  <TouchableOpacity
                    key={item.id || item.chit_custid || item.chit_groupcode || index}
                    style={[
                      styles.dropdownItem,
                      index === searchResults.length - 1 ? styles.noBorderBottom : null,
                    ]}
                    onPress={() => handleSelectCustomer(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dropdownAvatarCircle}>
                      <Text style={styles.dropdownAvatarText}>
                        {item.name ? item.name.charAt(0).toUpperCase() : 'C'}
                      </Text>
                    </View>

                    <View style={styles.dropdownInfoCol}>
                      <View style={styles.dropdownNameRow}>
                        <Text style={styles.dropdownCustomerName}>{item.name}</Text>
                        {item.chit_groupcode ? (
                          <View style={styles.dropdownCodeBadge}>
                            <Text style={styles.dropdownCodeText}>{item.chit_groupcode}</Text>
                          </View>
                        ) : null}
                      </View>

                      <View style={styles.dropdownSubRow}>
                        {item.mobile ? (
                          <View style={styles.dropdownSubItem}>
                            <Ionicons name="call-outline" size={moderateScale(10)} color={colors.textSecondary} />
                            <Text style={styles.dropdownSubText}>{item.mobile}</Text>
                          </View>
                        ) : null}
                        {item.group_name ? (
                          <View style={styles.dropdownSubItem}>
                            <Text style={styles.dropdownSubText}>{item.group_name}</Text>
                          </View>
                        ) : null}
                      </View>

                      {item.pending_amount !== undefined ? (
                        <View style={styles.dropdownPendingRow}>
                          <Text style={styles.dropdownPendingLabel}>Pending Due:</Text>
                          <Text style={styles.dropdownPendingAmount}>{formatCurrency(item.pending_amount)}</Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.dropdownActionCircle}>
                      <Ionicons name="arrow-forward" size={moderateScale(13)} color={colors.primary} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Customer Details Display */}
          {customerData ? (
            <View style={styles.detailsContainer}>
              {/* Customer Profile Banner */}
              <View style={styles.customerHeaderCard}>
                <View style={styles.customerAvatarCircle}>
                  <Text style={styles.customerAvatarText}>
                    {customerData.name ? customerData.name.charAt(0).toUpperCase() : 'C'}
                  </Text>
                </View>
                <View style={styles.customerTextCol}>
                  <Text style={styles.customerName}>{customerData.name}</Text>
                  <View style={styles.customerMetaRow}>
                    <View style={styles.phoneChip}>
                      <Ionicons name="call-outline" size={moderateScale(11)} color={colors.textSecondary} />
                      <Text style={styles.phoneChipText}>{customerData.mobile}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Financial Balance Summary */}
              <View style={styles.balanceGrid}>
                <View style={[styles.balanceCard, styles.paidCard]}>
                  <View style={styles.balanceHeader}>
                    <Ionicons name="checkmark-circle" size={moderateScale(16)} color={colors.success} />
                    <Text style={[styles.balanceLabel, { color: colors.successText }]}>Total Paid</Text>
                  </View>
                  <Text style={[styles.balanceValue, { color: colors.successText }]}>
                    {formatCurrency(customerData.total_paid_amount)}
                  </Text>
                </View>

                <View style={[styles.balanceCard, styles.pendingCard]}>
                  <View style={styles.balanceHeader}>
                    <Ionicons name="time" size={moderateScale(16)} color={colors.warning} />
                    <Text style={[styles.balanceLabel, { color: colors.warningText }]}>Pending Due</Text>
                  </View>
                  <Text style={[styles.balanceValue, { color: colors.warningText }]}>
                    {formatCurrency(customerData.pending_amount)}
                  </Text>
                </View>
              </View>

           
              {/* Chit Info List Card */}
              <View style={styles.chitInfoCard}>
                <Text style={styles.infoSectionHeading}>Chit Plan Information</Text>

                <InfoRow
                  label="Chit Plan"
                  value={customerData.chit_plan ? formatCurrency(customerData.chit_plan) : '-'}
                  icon={<MaterialCommunityIcons name="finance" size={moderateScale(16)} color={colors.primary} />}
                />
                <InfoRow
                  label="Chit Amount"
                  value={customerData.chit_amount ? formatCurrency(customerData.chit_amount) : '-'}
                  icon={<MaterialCommunityIcons name="cash-multiple" size={moderateScale(16)} color={colors.success} />}
                />
                <InfoRow
                  label="Perday Collection Amount"
                  value={customerData.perday_collection_amount ? formatCurrency(customerData.perday_collection_amount) : '-'}
                  icon={<MaterialCommunityIcons name="calendar-today" size={moderateScale(16)} color={colors.info} />}
                />
                <InfoRow
                  label="Group Name"
                  value={customerData.group_name || '-'}
                  icon={<Ionicons name="people-outline" size={moderateScale(16)} color={colors.info} />}
                />
                <InfoRow
                  label="Started Date"
                  value={customerData.chit_started_date ? formatDateDMY(customerData.chit_started_date) : '-'}
                  icon={<Ionicons name="calendar-outline" size={moderateScale(16)} color={colors.textSecondary} />}
                />
                {customerData.last_payment_date ? (
                  <InfoRow
                    label="Last Payment Date"
                    value={formatDateDMY(customerData.last_payment_date)}
                    icon={<Ionicons name="checkmark-circle-outline" size={moderateScale(16)} color={colors.success} />}
                    valueColor={colors.successText}
                  />
                ) : null}
                {customerData.next_chit_date ? (
                  <InfoRow
                    label="Next Due Date"
                    value={formatDateDMY(customerData.next_chit_date)}
                    icon={<Ionicons name="alarm-outline" size={moderateScale(16)} color={colors.warning} />}
                    valueColor={colors.warning}
                    isHighlight
                    showBorder={false}
                  />
                ) : null}
              </View>

              {/* Payment Entry Card */}
              <View style={styles.paymentCard}>
                <Text style={styles.cardSectionTitle}>Record Collection</Text>
                <Text style={styles.cardSectionSubtitle}>Enter the amount received from customer</Text>

                <CustomInput
                  label="Collection Amount (₹)"
                  value={amount}
                  onChangeText={(text) => {
                    setAmount(text);
                    if (amountError) {
                      setAmountError('');
                    }
                  }}
                  placeholder="Enter amount (e.g. 5000)"
                  iconName="cash-outline"
                  keyboardType="numeric"
                  error={amountError}
                  containerStyle={{ marginTop: spacing.xs }}
                />

                {/* Quick Amount Suggestion Chips */}
                <View style={styles.quickChipsRow}>
                  {(function() {
                    const planAmt = customerData?.chit_plan ? parseAmount(customerData.chit_plan) : 0;
                    console.log("PlanAmt",planAmt)
                    if (planAmt > 0) {
                      return [planAmt / 20, planAmt / 10, planAmt / 5, planAmt / 2];
                    }
                    return [500, 1000, 2000, 5000];
                  })().map((val) => (
                    <TouchableOpacity
                      key={val}
                      style={styles.quickChip}
                      onPress={() => handleQuickAmount(val)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.quickChipText}>+{formatCurrency(val)}</Text>
                    </TouchableOpacity>
                  ))}
                  {customerData.pending_amount ? (
                    <TouchableOpacity
                      style={[styles.quickChip, styles.fullPendingChip]}
                      onPress={() => handleQuickAmount(customerData.pending_amount)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.fullPendingChipText}>Full Due</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* Collect Button */}
                <CustomButton
                  title="COLLECT PAYMENT NOW"
                  onPress={handlePayNow}
                  loading={isLoading}
                  rounded="lg"
                  height={moderateScale(50)}
                  style={styles.payBtn}
                  rightIcon={
                    <Ionicons
                      name="checkmark-done-circle"
                      size={moderateScale(22)}
                      color={colors.white}
                    />
                  }
                />
              </View>
            </View>
          ) : (
            <EmptyState
              title="Search a Customer"
              message="Enter a valid Customer ID or Mobile number above to view Chit plan details and collect payments."
              iconName="person-search-outline"
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingModal visible={isLoading} message={loadingText} />
    </GradientScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  agentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  agentInfoCol: {
    flex: 1,
  },
  agentLabel: {
    ...typography.caption,
    fontSize: moderateScale(10),
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  agentValue: {
    ...typography.body,
    fontSize: moderateScale(13.5),
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 1,
  },
  agentPhoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.borderBrand,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 1,
    borderRadius: radius.full,
  },
  agentPhoneText: {
    ...typography.caption,
    fontSize: moderateScale(11),
    color: colors.primary,
    fontWeight: '700',
    marginLeft: spacing.xxs,
  },
  searchCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.2,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  cardSectionTitle: {
    ...typography.heading,
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardSectionSubtitle: {
    ...typography.caption,
    fontSize: moderateScale(12),
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  searchInputWrapper: {
    flex: 1,
    marginRight: spacing.xs,
  },
  searchBtn: {
    minWidth: moderateScale(85),
    marginTop: 0,
  },
  liveSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  liveSearchText: {
    ...typography.caption,
    fontSize: moderateScale(11),
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  dropdownContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.2,
    borderColor: colors.borderBrand,
    marginTop: spacing.sm,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownHeaderText: {
    ...typography.caption,
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: colors.primary,
    marginLeft: spacing.xxs + 2,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  noBorderBottom: {
    borderBottomWidth: 0,
  },
  dropdownAvatarCircle: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.borderBrand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  dropdownAvatarText: {
    ...typography.heading,
    fontSize: moderateScale(14),
    fontWeight: '800',
    color: colors.primary,
  },
  dropdownInfoCol: {
    flex: 1,
  },
  dropdownNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownCustomerName: {
    ...typography.heading,
    fontSize: moderateScale(13.5),
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dropdownCodeBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  dropdownCodeText: {
    ...typography.caption,
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: colors.primary,
  },
  dropdownSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
    gap: spacing.xs,
  },
  dropdownSubItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownSubText: {
    ...typography.caption,
    fontSize: moderateScale(10.5),
    color: colors.textSecondary,
    marginLeft: 2,
  },
  dropdownPendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dropdownPendingLabel: {
    ...typography.caption,
    fontSize: moderateScale(10),
    color: colors.textMuted,
    marginRight: 4,
  },
  dropdownPendingAmount: {
    ...typography.currency,
    fontSize: moderateScale(11.5),
    fontWeight: '700',
    color: colors.warningText,
  },
  dropdownActionCircle: {
    width: moderateScale(26),
    height: moderateScale(26),
    borderRadius: radius.full,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  detailsContainer: {
    marginTop: spacing.sm,
  },
  customerHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.2,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    padding: spacing.md,
  },
  customerAvatarCircle: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.borderBrand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  customerAvatarText: {
    ...typography.heading,
    fontSize: moderateScale(20),
    fontWeight: '800',
    color: colors.primary,
  },
  customerTextCol: {
    flex: 1,
  },
  customerName: {
    ...typography.heading,
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: colors.textPrimary,
  },
  customerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xxs,
  },
  phoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginRight: spacing.xs,
  },
  phoneChipText: {
    ...typography.caption,
    fontSize: moderateScale(11),
    color: colors.textSecondary,
    marginLeft: 3,
  },
  idChip: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  idChipText: {
    ...typography.caption,
    fontSize: moderateScale(10.5),
    fontWeight: '700',
    color: colors.primary,
  },
  balanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  balanceCard: {
    flex: 0.485,
    borderRadius: radius.lg,
    borderWidth: 1.2,
    padding: spacing.md,
  },
  paidCard: {
    backgroundColor: colors.successLight,
    borderColor: colors.successBorder,
  },
  pendingCard: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warningBorder,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  balanceLabel: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: moderateScale(11.5),
    marginLeft: spacing.xxs + 2,
  },
  balanceValue: {
    ...typography.currency,
    fontSize: moderateScale(18),
    fontWeight: '800',
  },
  chitInfoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.2,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  infoSectionHeading: {
    ...typography.heading,
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  paymentCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.2,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  quickChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xxs,
    marginBottom: spacing.md,
  },
  quickChip: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  quickChipText: {
    ...typography.caption,
    fontSize: moderateScale(11.5),
    fontWeight: '700',
    color: colors.textPrimary,
  },
  fullPendingChip: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warningBorder,
  },
  fullPendingChipText: {
    ...typography.caption,
    fontSize: moderateScale(11.5),
    fontWeight: '700',
    color: colors.warningText,
  },
  payBtn: {
    marginTop: spacing.xs,
  },
  noMarginBottom: {
    marginBottom: 0,
  },
});

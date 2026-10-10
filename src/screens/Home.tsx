import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import logo from '../assests/logo.png';
import { StorageService } from '../constants/StorageService';
import { STORAGE_KEYS } from '../constants/storage';
import { myAccount, todayEarnings } from '../services/apiService';
import { formatCurrency } from '../utils/currency';
import { formatDateDMY } from '../utils/date';
import { colors, spacing, radius, typography, moderateScale } from '../theme';
import { RootStackParamList, TransactionItem } from '../types';

interface HomeProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
}

export default function Home({ navigation }: HomeProps) {
  const insets = useSafeAreaInsets();
  const [agentName, setAgentName] = useState('Agent');
  const [agentMobile, setAgentMobile] = useState('');
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [todayTotal, setTodayTotal] = useState<string | number>('0');
  const [todayCount, setTodayCount] = useState<number>(0);
  const [todayList, setTodayList] = useState<TransactionItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      const name = await StorageService.getUserName();
      const mobile = await StorageService.getUserMobile();
      const storedImage = await StorageService.getItem<string>(STORAGE_KEYS.PROFILE_IMAGE);
      if (storedImage) {
        setProfileImageUri(storedImage);
      } else {
        setProfileImageUri(null);
      }
      if (name) {
        setAgentName(name);
      }
      if (mobile) {
        setAgentMobile(mobile);
      }

      // Fetch Profile in background
      const accountData = await myAccount();
      if (Array.isArray(accountData) && accountData.length > 0) {
        const agent = accountData[0];
        if (agent.agent_name) {
          setAgentName(agent.agent_name);
        }
        if (agent.agent_mobile) {
          setAgentMobile(agent.agent_mobile);
        }
      }

      // Fetch Today collection snapshot & transaction list
      const earnings = await todayEarnings();
      if (earnings) {
        setTodayTotal(earnings.total_earnings || '0');
        const list = earnings.individual_earnings || [];
        setTodayList(list);
        setTodayCount(list.length);
      } else {
        setTodayTotal('0');
        setTodayList([]);
        setTodayCount(0);
      }
    } catch (e) {
      console.error('[Home] Error loading dashboard data:', e);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const quickActions = [
    {
      id: 'collection',
      title: 'Chit Collection',
      subtitle: 'Collect Due',
      actionLabel: 'Collect',
      accentColor: '#F97316',
      iconName: 'wallet',
      iconBg: '#FFF7ED',
      iconColor: '#EA580C',
      borderColor: '#FED7AA',
      onPress: () => navigation.navigate('Collection'),
    },
    {
      id: 'transaction',
      title: 'Reports & Logs',
      subtitle: 'View Ledger',
      actionLabel: 'Logs',
      accentColor: '#2563EB',
      iconName: 'receipt',
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
      borderColor: '#BFDBFE',
      onPress: () => navigation.navigate('Transaction'),
    },
    {
      id: 'account',
      title: 'Agent Profile',
      subtitle: 'Credentials',
      actionLabel: 'Account',
      accentColor: '#10B981',
      iconName: 'person',
      iconBg: '#ECFDF5',
      iconColor: '#059669',
      borderColor: '#A7F3D0',
      onPress: () => navigation.navigate('MyAccount'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        animated={true}
        translucent={true}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Top Header Banner with Solid Brand Color */}
        <View style={[styles.headerContainer, { paddingTop: insets.top + spacing.sm }]}>
          {/* Top Brand & Profile Bar */}
          <View style={styles.headerTopBar}>
            {/* Left: App Logo from assets & Company Name */}
            <View style={styles.brandRow}>
              <View style={styles.logoFrame}>
                <Image source={logo} style={styles.brandLogo} resizeMode="contain" />
              </View>
              <View style={styles.brandTextCol}>
                <Text style={styles.brandTitle}>PUNNAGAI CHIT FUNDS</Text>
                <View style={styles.portalPill}>
                  <View style={styles.livePulseDot} />
                  <Text style={styles.portalSubText}>FIELD AGENT PORTAL</Text>
                </View>
              </View>
            </View>

            {/* Right: Clickable Profile Avatar Button (No Right Arrow) */}
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => navigation.navigate('MyAccount')}
              activeOpacity={0.75}
            >
              <View style={styles.profileAvatarCircle}>
                {profileImageUri ? (
                  <Image source={{ uri: profileImageUri }} style={styles.profileAvatarImage} />
                ) : (
                  <Text style={styles.profileAvatarInitial}>
                    {agentName ? agentName.charAt(0).toUpperCase() : 'A'}
                  </Text>
                )}
              </View>
              <View style={styles.profileOnlineBadge} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Today Snapshot Widget */}
        <TouchableOpacity
          style={styles.todaySnapshotCard}
          onPress={() => navigation.navigate('Transaction')}
          activeOpacity={0.85}
        >
          <View style={styles.snapshotTopRow}>
            <View style={styles.snapshotBadge}>
              <View style={styles.greenPulseDot} />
              <Text style={styles.snapshotBadgeText}>TODAY'S COLLECTIONS</Text>
            </View>
            <View style={styles.snapshotDateTag}>
              <Ionicons name="calendar-outline" size={moderateScale(12)} color={colors.textSecondary} />
              <Text style={styles.snapshotDateText}>Today</Text>
            </View>
          </View>

          <View style={styles.snapshotAmountRow}>
            <Text style={styles.snapshotAmount}>{formatCurrency(todayTotal)}</Text>
          </View>

          <View style={styles.snapshotFooterRow}>
            <View style={styles.snapshotCountInfo}>
              <Ionicons name="checkmark-circle" size={moderateScale(14)} color={colors.success} />
              <Text style={styles.snapshotSubtext}>
                {todayCount} {todayCount === 1 ? 'collection recorded' : 'collections recorded'}
              </Text>
            </View>
            <View style={styles.snapshotViewBtn}>
              <Text style={styles.snapshotViewBtnText}>View Reports</Text>
              <Ionicons name="arrow-forward" size={moderateScale(12)} color={colors.primary} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Today's Collections Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionTitleGroup}>
              <Text style={styles.sectionTitle}>Today's Collections</Text>
              {todayList.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{todayList.length}</Text>
                </View>
              )}
            </View>
            {todayList.length > 0 && (
              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => navigation.navigate('Transaction')}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="arrow-forward" size={moderateScale(13)} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.sectionSubtitle}>Recent payments collected today</Text>
        </View>

        {/* Today Collections Card List */}
        <View style={styles.collectionsCard}>
          {todayList.length === 0 ? (
            <View style={styles.emptyCollectionBox}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="receipt-outline" size={moderateScale(28)} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No Collections Yet Today</Text>
              <Text style={styles.emptySubtitle}>
                Payments collected from customers today will appear here in real-time.
              </Text>
              <TouchableOpacity
                style={styles.startCollectBtn}
                onPress={() => navigation.navigate('Collection')}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={moderateScale(16)} color={colors.white} />
                <Text style={styles.startCollectText}>Record New Collection</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {/* Show only first 5 items */}
              {todayList.slice(0, 5).map((item, idx) => (
                <TouchableOpacity
                  key={`${item.id || idx}-${idx}`}
                  style={[
                    styles.txItemRow,
                    idx < Math.min(todayList.length, 5) - 1 && styles.txBorderBottom,
                  ]}
                  onPress={() => navigation.navigate('Transaction')}
                  activeOpacity={0.7}
                >
                  <View style={styles.txAvatarCircle}>
                    <Text style={styles.txAvatarText}>
                      {(item.name || 'C').charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.txInfoCol}>
                    <Text style={styles.txCustomerName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={styles.txMetaRow}>
                      <Ionicons name="time-outline" size={moderateScale(11)} color={colors.textSecondary} />
                      <Text style={styles.txDateText}>{item.date ? formatDateDMY(item.date) : 'Today'}</Text>
                      {item.id ? <Text style={styles.txIdText}>• ID: #{item.id}</Text> : null}
                    </View>
                  </View>

                  <View style={styles.txAmountCol}>
                    <Text style={styles.txAmountText}>+ {formatCurrency(item.amount)}</Text>
                    <Ionicons name="chevron-forward" size={moderateScale(14)} color={colors.textMuted} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionTitleGroup}>
              <Ionicons name="flash" size={moderateScale(15)} color={colors.accentGold} style={{ marginRight: 5 }} />
              <Text style={styles.sectionTitle}>Quick Services</Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>Fast access to field operations</Text>
        </View>

        {/* 3-Column Luxury Feature Cards Grid */}
        <View style={styles.quickGrid}>
          {quickActions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.compactCard,
                { borderTopColor: item.accentColor, borderColor: item.borderColor },
              ]}
              onPress={item.onPress}
              activeOpacity={0.75}
            >
              <View style={[styles.compactIconCircle, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.iconName} size={moderateScale(19)} color={item.iconColor} />
              </View>

              <Text style={styles.compactTitle} numberOfLines={1}>
                {item.title}
              </Text>

              <Text style={styles.compactSubtitle} numberOfLines={1}>
                {item.subtitle}
              </Text>

              <View style={[styles.compactActionPill, { backgroundColor: item.iconBg }]}>
                <Text style={[styles.compactActionText, { color: item.iconColor }]}>
                  {item.actionLabel}
                </Text>
                <Ionicons name="arrow-forward" size={moderateScale(9)} color={item.iconColor} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Company Info Card */}
        <View style={styles.footerInfoCard}>
          <MaterialCommunityIcons
            name="office-building"
            size={moderateScale(20)}
            color={colors.primary}
          />
          <View style={styles.footerInfoTextCol}>
            <Text style={styles.footerCompanyName}>Punnagai Chit Funds Pvt Ltd</Text>
            <Text style={styles.footerSupportText}>Authorized Field Agent Application</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  headerContainer: {
    backgroundColor: colors.primary,
    paddingTop: spacing.md,
    paddingBottom: moderateScale(86),
    paddingHorizontal: spacing.lg,
  },
  headerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  logoFrame: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: radius.md + 2,
    backgroundColor: colors.white,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs + 4,
  },
  brandLogo: {
    width: '100%',
    height: '100%',
  },
  brandTextCol: {
    flex: 1,
  },
  brandTitle: {
    ...typography.heading,
    fontSize: moderateScale(14.5),
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.8,
  },
  portalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs + 3,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    marginTop: 2,
  },
  livePulseDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: radius.full,
    backgroundColor: '#34D399',
    marginRight: 4,
  },
  portalSubText: {
    ...typography.caption,
    fontSize: moderateScale(9.5),
    fontWeight: '800',
    color: '#A7F3D0',
    letterSpacing: 0.6,
  },
  profileBtn: {
    position: 'relative',
    padding: 2,
  },
  profileAvatarCircle: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    shadowOffset: { width: 0, height: 2 },
  },
  profileAvatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileAvatarInitial: {
    fontSize: moderateScale(20),
    fontWeight: '900',
    color: colors.primary,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  profileOnlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: moderateScale(13),
    height: moderateScale(13),
    borderRadius: radius.full,
    backgroundColor: '#10B981',
    borderWidth: 2.5,
    borderColor: colors.primary,
    zIndex: 5,
  },
  todaySnapshotCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1.2,
    borderColor: colors.border,
    marginHorizontal: spacing.lg,
    marginTop: -moderateScale(64),
    paddingTop: spacing.md,
    paddingBottom: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  snapshotTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  snapshotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: spacing.xs + 3,
    paddingVertical: 2.5,
    borderRadius: radius.full,
  },
  greenPulseDot: {
    width: moderateScale(6.5),
    height: moderateScale(6.5),
    borderRadius: radius.full,
    backgroundColor: colors.success,
    marginRight: 4,
  },
  snapshotBadgeText: {
    ...typography.caption,
    fontSize: moderateScale(10),
    fontWeight: '800',
    color: colors.successText,
    letterSpacing: 0.4,
  },
  snapshotDateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  snapshotDateText: {
    ...typography.caption,
    fontSize: moderateScale(10.5),
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 3,
  },
  snapshotAmountRow: {
    marginVertical: spacing.xxs,
  },
  snapshotAmount: {
    ...typography.currency,
    fontSize: moderateScale(26),
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  snapshotFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  snapshotCountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  snapshotSubtext: {
    ...typography.caption,
    fontSize: moderateScale(11),
    color: colors.textSecondary,
    fontWeight: '500',
    marginLeft: 4,
  },
  snapshotViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: spacing.xs + 3,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  snapshotViewBtnText: {
    ...typography.caption,
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: colors.primary,
    marginRight: 2,
  },
  sectionHeader: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.sectionTitle,
    fontSize: moderateScale(16.5),
    fontWeight: '700',
    color: colors.textPrimary,
  },
  countBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 1,
    borderRadius: radius.full,
    marginLeft: spacing.xs,
  },
  countBadgeText: {
    ...typography.caption,
    fontSize: moderateScale(11),
    fontWeight: '800',
    color: colors.primary,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
  },
  viewAllText: {
    ...typography.caption,
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: colors.primary,
    marginRight: 2,
  },
  sectionSubtitle: {
    ...typography.caption,
    fontSize: moderateScale(12),
    color: colors.textMuted,
    marginTop: 2,
  },
  collectionsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1.2,
    borderColor: colors.border,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  emptyCollectionBox: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyIconCircle: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: radius.full,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.heading,
    fontSize: moderateScale(14.5),
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    ...typography.caption,
    fontSize: moderateScale(12),
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  startCollectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    borderRadius: radius.full,
  },
  startCollectText: {
    ...typography.caption,
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: colors.white,
    marginLeft: spacing.xs,
  },
  listContainer: {
    paddingVertical: 2,
  },
  txItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  txBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  txAvatarCircle: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.borderBrand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  txAvatarText: {
    ...typography.heading,
    fontSize: moderateScale(14),
    fontWeight: '800',
    color: colors.primary,
  },
  txInfoCol: {
    flex: 1,
  },
  txCustomerName: {
    ...typography.heading,
    fontSize: moderateScale(13.5),
    fontWeight: '700',
    color: colors.textPrimary,
  },
  txMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  txDateText: {
    ...typography.caption,
    fontSize: moderateScale(11),
    color: colors.textSecondary,
    marginLeft: 3,
  },
  txIdText: {
    ...typography.caption,
    fontSize: moderateScale(11),
    color: colors.textMuted,
    marginLeft: spacing.xxs,
  },
  txAmountCol: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  txAmountText: {
    ...typography.currency,
    fontSize: moderateScale(13.5),
    fontWeight: '800',
    color: colors.successText,
    marginRight: spacing.xxs,
  },
  moreViewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingVertical: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  moreViewAllText: {
    ...typography.caption,
    fontSize: moderateScale(12.5),
    fontWeight: '700',
    color: colors.primary,
    marginRight: spacing.xs,
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  compactCard: {
    width: '31.5%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg + 2,
    borderWidth: 1.2,
    borderTopWidth: 3,
    paddingVertical: spacing.xs + 3,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: moderateScale(105),
  },
  compactIconCircle: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3,
  },
  compactTitle: {
    ...typography.heading,
    fontSize: moderateScale(11),
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 1,
  },
  compactSubtitle: {
    ...typography.caption,
    fontSize: moderateScale(9),
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 1,
    marginBottom: 4,
  },
  compactActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radius.full,
  },
  compactActionText: {
    ...typography.caption,
    fontSize: moderateScale(8.5),
    fontWeight: '800',
    marginRight: 2,
  },
  footerInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  footerInfoTextCol: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  footerCompanyName: {
    ...typography.body,
    fontSize: moderateScale(12.5),
    fontWeight: '700',
    color: colors.textPrimary,
  },
  footerSupportText: {
    ...typography.caption,
    fontSize: moderateScale(11),
    color: colors.textMuted,
    marginTop: 1,
  },
});

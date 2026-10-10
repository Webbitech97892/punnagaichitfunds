import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  GradientScreenWrapper,
  SegmentedTabBar,
  TabItem,
} from '../components';
import Today from './Today';
import History from './History';
import Customer from './Customer';
import { colors, spacing, moderateScale } from '../theme';
import { RootStackParamList } from '../types';

const TAB_CONFIG: TabItem[] = [
  {
    title: 'Today',
    icon: (active: boolean) => (
      <Ionicons
        name={active ? 'today' : 'today-outline'}
        size={moderateScale(15)}
        color={active ? colors.white : colors.textSecondary}
      />
    ),
  },
  {
    title: 'Date Range',
    icon: (active: boolean) => (
      <Ionicons
        name={active ? 'calendar' : 'calendar-outline'}
        size={moderateScale(15)}
        color={active ? colors.white : colors.textSecondary}
      />
    ),
  },
  {
    title: 'Customer',
    icon: (active: boolean) => (
      <Ionicons
        name={active ? 'person' : 'person-outline'}
        size={moderateScale(15)}
        color={active ? colors.white : colors.textSecondary}
      />
    ),
  },
];

interface TransactionProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Transaction'>;
}

export default function Transaction({ navigation }: TransactionProps) {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <GradientScreenWrapper
      title="Transactions & Reports"
      subtitle="View collections and customer history"
      showBack={false}
    >
      <View style={styles.tabBarContainer}>
        <SegmentedTabBar
          tabs={TAB_CONFIG}
          selectedIndex={selectedTab}
          onTabChange={(index) => setSelectedTab(index)}
          containerStyle={styles.segmentedTabBar}
        />
      </View>

      <View style={styles.tabContent}>
        {selectedTab === 0 && <Today name="Today" />}
        {selectedTab === 1 && <History name="History" />}
        {selectedTab === 2 && <Customer name="Customer" />}
      </View>
    </GradientScreenWrapper>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.xs,
  },
  segmentedTabBar: {
    marginVertical: spacing.xxs,
    marginHorizontal: spacing.md,
  },
  tabContent: {
    flex: 1,
  },
});

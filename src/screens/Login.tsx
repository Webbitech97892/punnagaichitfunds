import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import logo from '../assests/logo.png';
import {loginUser, myAccount} from '../services/apiService';
import {StorageService} from '../constants/StorageService';
import {STORAGE_KEYS} from '../constants/storage';
import {APP_VERSION} from '../constants/appVersion';
import {CustomInput, CustomButton, LoadingModal} from '../components';
import {colors, spacing, radius, typography, moderateScale} from '../theme';
import {RootStackParamList} from '../types';

interface LoginProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
}

export default function Login({navigation}: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userError, setUserError] = useState('');
  const [passError, setPassError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    let hasError = false;

    if (!username.trim()) {
      setUserError('Agent ID / Mobile is required');
      hasError = true;
    } else {
      setUserError('');
    }

    if (!password.trim()) {
      setPassError('Password is required');
      hasError = true;
    } else {
      setPassError('');
    }

    if (hasError) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginUser({
        name: username.trim(),
        password: password.trim(),
      });

      if (response?.response_status === 'success' && response?.data?.id) {
        const userId = response.data.id;
        await StorageService.setItem(STORAGE_KEYS.USER_ID, userId);

        // Fetch Agent Account profile in background
        const accountData = await myAccount(userId);
        if (Array.isArray(accountData) && accountData.length > 0) {
          const agent = accountData[0];
          if (agent.agent_name) {
            await StorageService.setItem(
              STORAGE_KEYS.USER_NAME,
              agent.agent_name,
            );
          }
          if (agent.agent_mobile) {
            await StorageService.setItem(
              STORAGE_KEYS.USER_MOBILE,
              agent.agent_mobile,
            );
          }
          await StorageService.setItem(STORAGE_KEYS.AGENT_DATA, agent);
        }

        setIsLoading(false);
        setUsername('');
        setPassword('');
        navigation.replace('MainTabs');
      } else {
        setIsLoading(false);
        const errMsg =
          response?.message ||
          'Invalid username or password. Please check and try again.';
        Alert.alert('Login Failed', errMsg, [{text: 'OK'}]);
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        'Error',
        'Unable to connect to the server. Please try again later.',
      );
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        animated={true}
        translucent={true}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex1}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Top Brand & Header Section - Clean Modern Presentation without Bulky Banner */}
          <View style={styles.brandSection}>
            <View style={styles.logoWrapper}>
              <Image
                source={logo}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.brandBadge}>
              <Ionicons
                name="shield-checkmark"
                size={moderateScale(13)}
                color={colors.primary}
              />
              <Text style={styles.brandBadgeText}>
                Field Agent Collection Portal
              </Text>
            </View>
          </View>

          {/* Login Card */}
          <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <Text style={styles.welcomeTitle}>Welcome Back</Text>
              <Text style={styles.welcomeSubtitle}>
                Sign in with your agent credentials to start your collection
                session
              </Text>
            </View>

            <CustomInput
              label="Username / Mobile"
              value={username}
              onChangeText={text => {
                setUsername(text);
                if (userError) {
                  setUserError('');
                }
              }}
              placeholder="e.g. AGENT001 or 9876543210"
              iconName="person-outline"
              autoCapitalize="none"
              error={userError}
            />

            <CustomInput
              label="Password"
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (passError) {
                  setPassError('');
                }
              }}
              placeholder="Enter your password"
              iconName="lock-closed-outline"
              secureTextEntry
              error={passError}
            />

            <CustomButton
              title="SIGN IN TO PORTAL"
              onPress={handleLogin}
              loading={isLoading}
              rounded="lg"
              height={moderateScale(50)}
              style={styles.loginBtn}
              rightIcon={
                <Ionicons
                  name="arrow-forward"
                  size={moderateScale(20)}
                  color={colors.white}
                />
              }
            />

            {/* Security Guarantee Row */}
            <View style={styles.securityRow}>
              <MaterialCommunityIcons
                name="shield-lock-outline"
                size={moderateScale(16)}
                color={colors.textSecondary}
              />
              <Text style={styles.securityText}>
                Authorized Agent Access • 256-Bit Encrypted
              </Text>
            </View>
          </View>

          {/* Company Support Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.companyFooterText}>
              Punnagai Chit Funds Pvt Ltd
            </Text>
            <Text style={styles.versionText}>
              Secure Field Terminal • {APP_VERSION}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingModal
        visible={isLoading}
        message="Authenticating..."
        submessage="Verifying agent credentials"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoWrapper: {
    width: moderateScale(220),
    height: moderateScale(68),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.borderBrand,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  brandBadgeText: {
    ...typography.caption,
    fontSize: moderateScale(11.5),
    fontWeight: '700',
    color: colors.primary,
    marginLeft: spacing.xs,
    letterSpacing: 0.2,
  },
  cardContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1.2,
    borderColor: colors.border,
    padding: spacing.lg,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    marginBottom: spacing.lg,
  },
  welcomeTitle: {
    ...typography.heading,
    fontSize: moderateScale(21),
    fontWeight: '800',
    color: colors.textPrimary,
  },
  welcomeSubtitle: {
    ...typography.body,
    fontSize: moderateScale(13),
    color: colors.textSecondary,
    marginTop: spacing.xxs,
    lineHeight: moderateScale(18),
  },
  loginBtn: {
    marginTop: spacing.sm,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  securityText: {
    ...typography.caption,
    fontSize: moderateScale(11),
    color: colors.textSecondary,
    marginLeft: spacing.xxs + 2,
    fontWeight: '500',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  companyFooterText: {
    ...typography.caption,
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: colors.textSecondary,
  },
  versionText: {
    ...typography.caption,
    fontSize: moderateScale(10.5),
    color: colors.textMuted,
    marginTop: 2,
  },
});

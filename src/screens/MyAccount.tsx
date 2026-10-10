import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
  PermissionsAndroid,
  KeyboardAvoidingView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { myAccount, myAccountUpdate } from '../services/apiService';
import { StorageService } from '../constants/StorageService';
import { STORAGE_KEYS } from '../constants/storage';
import { APP_VERSION } from '../constants/appVersion';
import {
  GradientScreenWrapper,
  InfoRow,
  CustomInput,
  CustomButton,
  LoadingModal,
} from '../components';
import { colors, spacing, radius, typography, moderateScale } from '../theme';
import { AgentProfile, RootStackParamList } from '../types';

interface MyAccountProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MyAccount'>;
}

export default function MyAccount({ navigation }: MyAccountProps) {
  const [accountData, setAccountData] = useState<AgentProfile | null>(null);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Edit Form Fields
  const [editName, setEditName] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [nameError, setNameError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [addressError, setAddressError] = useState('');

  const loadProfileImage = async () => {
    try {
      const storedImage = await StorageService.getItem<string>(STORAGE_KEYS.PROFILE_IMAGE);
      if (storedImage) {
        setProfileImageUri(storedImage);
      }
    } catch (err) {
      console.error('[MyAccount] Error loading stored profile image:', err);
    }
  };

  const fetchProfile = async (showLoader = true) => {
    if (showLoader) {
      setIsLoading(true);
    }
    try {
      const data = await myAccount();
      if (Array.isArray(data) && data.length > 0) {
        setAccountData(data[0]);
      } else if (data && typeof data === 'object') {
        setAccountData(data as unknown as AgentProfile);
      }
    } catch (e) {
      console.error('[MyAccount] Profile fetch error:', e);
      if (showLoader) {
        Alert.alert('Error', 'Unable to fetch account details.');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile(false);
      loadProfileImage();
    }, [])
  );

  useEffect(() => {
    fetchProfile(true);
    loadProfileImage();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(false), loadProfileImage()]);
  };

  const openEditModal = () => {
    setEditName(accountData?.agent_name || '');
    setEditMobile(accountData?.agent_mobile || '');
    setEditAddress(accountData?.agent_address || '');
    setNameError('');
    setMobileError('');
    setAddressError('');
    setEditModalVisible(true);
  };

  const handleSelectImage = async (response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }
    if (response.errorCode) {
      console.error('[MyAccount] ImagePicker Error:', response.errorMessage);
      Alert.alert('Error', response.errorMessage || 'Failed to pick image.');
      return;
    }
    if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
      const uri = response.assets[0].uri;
      setProfileImageUri(uri);
      await StorageService.setItem(STORAGE_KEYS.PROFILE_IMAGE, uri);
    }
  };

  const openCamera = async () => {
    setPickerModalVisible(false);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App requires camera permission to capture your profile photo.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Camera permission is required to capture photos.');
          return;
        }
      }

      const result = await launchCamera({
        mediaType: 'photo',
        cameraType: 'front',
        quality: 0.8,
        maxWidth: 600,
        maxHeight: 600,
        saveToPhotos: false,
      });

      handleSelectImage(result);
    } catch (error: any) {
      console.error('[MyAccount] Camera launch error:', error);
      Alert.alert('Error', 'Unable to open camera.');
    }
  };

  const openGallery = async () => {
    setPickerModalVisible(false);
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 600,
        maxHeight: 600,
        selectionLimit: 1,
      });

      handleSelectImage(result);
    } catch (error: any) {
      console.error('[MyAccount] Gallery launch error:', error);
      Alert.alert('Error', 'Unable to open gallery.');
    }
  };

  const handleRemovePhoto = async () => {
    setPickerModalVisible(false);
    try {
      await StorageService.removeItem(STORAGE_KEYS.PROFILE_IMAGE);
      setProfileImageUri(null);
      Alert.alert('Profile Photo Removed', 'Your profile picture has been reset to default.');
    } catch (e) {
      console.error('[MyAccount] Remove photo error:', e);
    }
  };

  const handleSaveProfile = async () => {
    let valid = true;
    if (!editName.trim()) {
      setNameError('Agent name is required');
      valid = false;
    } else {
      setNameError('');
    }

    if (!editMobile.trim()) {
      setMobileError('Mobile number is required');
      valid = false;
    } else if (editMobile.trim().length !== 10) {
      setMobileError('Please enter a valid 10-digit mobile number');
      valid = false;
    } else {
      setMobileError('');
    }

    if (!editAddress.trim()) {
      setAddressError('Office address is required');
      valid = false;
    } else {
      setAddressError('');
    }

    if (!valid) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await myAccountUpdate({
        agent_name: editName.trim(),
        agent_mobile: editMobile.trim(),
        agent_address: editAddress.trim(),
        agent_photo: profileImageUri ? 'profile.jpg' : 'profile.jpg',
      });

      if (response && response.response_status === 'error') {
        Alert.alert('Update Failed', response.message || 'Unable to update profile.');
      } else {
        // Successfully updated
        setAccountData((prev) => ({
          agent_name: editName.trim(),
          agent_mobile: editMobile.trim(),
          agent_address: editAddress.trim(),
          agent_photo: prev?.agent_photo || 'profile.jpg',
          agent_id: prev?.agent_id || '19',
        }));

        await StorageService.setItem(STORAGE_KEYS.USER_NAME, editName.trim());
        await StorageService.setItem(STORAGE_KEYS.USER_MOBILE, editMobile.trim());

        setEditModalVisible(false);
        Alert.alert('Profile Updated', response.message || 'Agent profile updated successfully!');
      }
    } catch (error: any) {
      console.error('[MyAccount] Update profile error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to end your current session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearAuth();
            navigation.replace('Login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const agentName = accountData?.agent_name || 'Agent';
  const agentMobile = accountData?.agent_mobile || '-';
  const agentAddress = accountData?.agent_address || 'Punnagai Chit Funds Regional Branch';

  return (
    <GradientScreenWrapper
      title="My Profile"
      subtitle="Agent account & credentials"
      showBack={false}
    >
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
        {/* Executive Profile Avatar Card (Compact Horizontal Layout) */}
        <View style={styles.profileHeaderCard}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={() => setPickerModalVisible(true)}
            activeOpacity={0.85}
          >
            <View style={styles.avatarCircle}>
              {profileImageUri ? (
                <Image source={{ uri: profileImageUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {agentName ? agentName.charAt(0).toUpperCase() : 'A'}
                </Text>
              )}
            </View>
            {/* Camera Action Badge */}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={moderateScale(12)} color={colors.white} />
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfoCol}>
            <Text style={styles.agentNameText} numberOfLines={1}>
              {agentName}
            </Text>
            <Text style={styles.agentMobileSubText}>+91 {agentMobile}</Text>
            <View style={styles.rolePill}>
              <Ionicons name="shield-checkmark" size={moderateScale(11)} color={colors.primary} />
              <Text style={styles.rolePillText}>Field Collection Agent</Text>
            </View>
          </View>
        </View>

        {/* Section 1: Agent Details Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <Ionicons name="person-outline" size={moderateScale(18)} color={colors.primary} />
              <Text style={styles.sectionTitle}>Agent Information</Text>
            </View>
            {/* Edit Button with Theme Color */}
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={openEditModal}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="edit" color={colors.primary} size={moderateScale(14)} style={styles.editProfileBtnIcon} />
              <Text style={styles.editProfileBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <InfoRow
            label="Agent Name"
            value={agentName}
            icon={<Ionicons name="person" size={moderateScale(16)} color={colors.primary} />}
          />
          <InfoRow
            label="Mobile Number"
            value={agentMobile}
            icon={<Ionicons name="call" size={moderateScale(16)} color={colors.info} />}
          />
          <InfoRow
            label="Office Address"
            value={agentAddress}
            icon={<Ionicons name="location" size={moderateScale(16)} color={colors.error} />}
            showBorder={false}
          />
        </View>

        {/* Section 2: Security & App Info */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <MaterialCommunityIcons name="shield-check-outline" size={moderateScale(18)} color={colors.success} />
              <Text style={styles.sectionTitle}>System & Security</Text>
            </View>
          </View>

          <InfoRow
            label="Application Version"
            value={`${APP_VERSION} (Production)`}
            icon={<Ionicons name="phone-portrait-outline" size={moderateScale(16)} color={colors.textSecondary} />}
          />
          <InfoRow
            label="Environment"
            value="Secure Production"
            icon={<Ionicons name="cloud-done-outline" size={moderateScale(16)} color={colors.success} />}
          />
          <InfoRow
            label="Access Level"
            value="Authorized Agent"
            icon={<Ionicons name="key-outline" size={moderateScale(16)} color={colors.error} />}
            showBorder={false}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleLogout}
            activeOpacity={0.75}
          >
            <Ionicons name="log-out-outline" size={moderateScale(18)} color="#DC2626" style={styles.signOutBtnIcon} />
            <Text style={styles.signOutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.editModalContainer}>
            <View style={styles.modalHandleBar} />

            <View style={styles.editModalHeader}>
              <Text style={styles.modalTitle}>Edit Agent Profile</Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle-outline" size={moderateScale(24)} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Update your personal and contact details</Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.editFormScroll}
            >
              <CustomInput
                label="Agent Full Name"
                value={editName}
                onChangeText={(text) => {
                  setEditName(text);
                  if (nameError) {setNameError('');}
                }}
                placeholder="Enter full name"
                iconName="person-outline"
                error={nameError}
                autoCapitalize="words"
              />

              <CustomInput
                label="Mobile Number"
                value={editMobile}
                onChangeText={(text) => {
                  setEditMobile(text);
                  if (mobileError) {setMobileError('');}
                }}
                placeholder="Enter 10-digit mobile number"
                iconName="call-outline"
                keyboardType="phone-pad"
                maxLength={10}
                editable={false}
                error={mobileError}
              />

              <CustomInput
                label="Office Address"
                value={editAddress}
                onChangeText={(text) => {
                  setEditAddress(text);
                  if (addressError) {setAddressError('');}
                }}
                placeholder="Enter branch or office address"
                iconName="location-outline"
                error={addressError}
                autoCapitalize="words"
              />

              <View style={styles.editActionButtons}>
                <CustomButton
                  title="SAVE CHANGES"
                  onPress={handleSaveProfile}
                  loading={isSaving}
                  height={moderateScale(48)}
                  style={styles.saveBtn}
                  leftIcon={<Ionicons name="checkmark-done" size={moderateScale(18)} color={colors.white} />}
                />

                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setEditModalVisible(false)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Camera / Gallery Selection Bottom Sheet Modal */}
      <Modal
        visible={pickerModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPickerModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHandleBar} />
            <Text style={styles.modalTitle}>Update Profile Photo</Text>
            <Text style={styles.modalSubtitle}>Select camera or gallery to upload photo</Text>

            <View style={styles.pickerOptionsRow}>
              {/* Option 1: Camera */}
              <TouchableOpacity
                style={styles.pickerOptionBtn}
                onPress={openCamera}
                activeOpacity={0.75}
              >
                <View style={[styles.pickerIconCircle, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                  <Ionicons name="camera" size={moderateScale(24)} color={colors.primary} />
                </View>
                <Text style={styles.pickerOptionLabel}>Camera</Text>
                <Text style={styles.pickerOptionSub}>Take photo</Text>
              </TouchableOpacity>

              {/* Option 2: Gallery */}
              <TouchableOpacity
                style={styles.pickerOptionBtn}
                onPress={openGallery}
                activeOpacity={0.75}
              >
                <View style={[styles.pickerIconCircle, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                  <Ionicons name="images" size={moderateScale(24)} color={colors.success} />
                </View>
                <Text style={styles.pickerOptionLabel}>Gallery</Text>
                <Text style={styles.pickerOptionSub}>Choose file</Text>
              </TouchableOpacity>

              {/* Option 3: Remove Photo (if image exists) */}
              {profileImageUri ? (
                <TouchableOpacity
                  style={styles.pickerOptionBtn}
                  onPress={handleRemovePhoto}
                  activeOpacity={0.75}
                >
                  <View style={[styles.pickerIconCircle, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                    <Ionicons name="trash-outline" size={moderateScale(24)} color="#EF4444" />
                  </View>
                  <Text style={[styles.pickerOptionLabel, { color: '#DC2626' }]}>Remove</Text>
                  <Text style={styles.pickerOptionSub}>Reset default</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setPickerModalVisible(false)}
              activeOpacity={0.75}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <LoadingModal visible={isLoading} message="Loading Profile..." />
    </GradientScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl + 10,
  },
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1.2,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: spacing.md,
    alignSelf: 'center',
    padding: 2,
  },
  avatarCircle: {
    width: moderateScale(62),
    height: moderateScale(62),
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.borderBrand,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarText: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  profileInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  agentNameText: {
    ...typography.heading,
    fontSize: moderateScale(16.5),
    fontWeight: '800',
    color: colors.textPrimary,
  },
  agentMobileSubText: {
    ...typography.caption,
    fontSize: moderateScale(11.5),
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 4,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.borderBrand,
    paddingHorizontal: spacing.xs + 3,
    paddingVertical: 1.5,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  rolePillText: {
    ...typography.caption,
    fontSize: moderateScale(10.5),
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 3,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1.2,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.heading,
    fontSize: moderateScale(14.5),
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: spacing.xs,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3.5,
    borderRadius: radius.full,
  },
  editProfileBtnIcon: {
    marginRight: 3,
  },
  editProfileBtnText: {
    ...typography.caption,
    fontSize: moderateScale(11.5),
    fontWeight: '700',
    color: colors.primary,
  },
  actionButtonsContainer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.2,
    borderColor: '#FECACA',
    borderRadius: radius.md,
    height: moderateScale(48),
    width: '100%',
  },
  signOutBtnIcon: {
    marginRight: spacing.xs,
  },
  signOutBtnText: {
    ...typography.buttonPrimary,
    fontSize: moderateScale(14.5),
    fontWeight: '700',
    color: '#DC2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.lg,
    alignItems: 'center',
  },
  editModalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.lg,
    maxHeight: '85%',
  },
  editModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  editFormScroll: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  editActionButtons: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  saveBtn: {
    marginBottom: spacing.xs,
  },
  modalHandleBar: {
    width: moderateScale(40),
    height: 4,
    borderRadius: radius.full,
    backgroundColor: '#CBD5E1',
    marginBottom: spacing.md,
    alignSelf: 'center',
  },
  modalTitle: {
    ...typography.heading,
    fontSize: moderateScale(16.5),
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    ...typography.caption,
    fontSize: moderateScale(12),
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  pickerOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    width: '100%',
    marginBottom: spacing.xl,
  },
  pickerOptionBtn: {
    alignItems: 'center',
    width: moderateScale(92),
  },
  pickerIconCircle: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: radius.full,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  pickerOptionLabel: {
    ...typography.heading,
    fontSize: moderateScale(13.5),
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  pickerOptionSub: {
    ...typography.caption,
    fontSize: moderateScale(10.5),
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 1,
  },
  modalCancelBtn: {
    width: '100%',
    backgroundColor: colors.surfaceVariant,
    paddingVertical: spacing.md - 2,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  modalCancelText: {
    ...typography.body,
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: colors.textSecondary,
  },
});

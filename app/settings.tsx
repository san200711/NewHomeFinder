import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { getStoredApiKey, saveApiKey, clearApiKey, isRealEmailConfigured } from '@/services/email';
import { EmailConfig } from '@/config/email.config';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { showAlert } = useAlert();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Developer: Resend API key
  const [showDevSection, setShowDevSection] = useState(false);
  const [resendApiKey, setResendApiKey] = useState('');
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    getStoredApiKey().then((k) => setResendApiKey(k));
    isRealEmailConfigured().then((v) => setEmailConfigured(v));
  }, []);

  const handleSaveApiKey = async () => {
    if (!resendApiKey.trim()) {
      showAlert('Empty Key', 'Please enter your Resend API key.');
      return;
    }
    setSavingKey(true);
    try {
      await saveApiKey(resendApiKey.trim());
      const configured = await isRealEmailConfigured();
      setEmailConfigured(configured);
      showAlert('Saved', 'Resend API key saved. Real email OTP is now active.');
    } catch {
      showAlert('Error', 'Failed to save key.');
    } finally {
      setSavingKey(false);
    }
  };

  const handleClearApiKey = async () => {
    showAlert('Clear API Key', 'This will revert to mock OTP (123456). Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearApiKey();
          setResendApiKey('');
          setEmailConfigured(false);
          showAlert('Cleared', 'API key removed. App will use mock OTP.');
        },
      },
    ]);
  };

  if (!user) {
    router.replace('/');
    return null;
  }

  const handleSave = () => {
    // In a real app, this would update the user profile
    showAlert('Success', 'Profile updated successfully');
    setIsEditing(false);
  };

  const handleLogout = () => {
    showAlert('Confirm Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    showAlert('Delete Account', 'This action cannot be undone. All your data will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          showAlert('Account Deleted', 'Your account has been deleted');
          logout();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[theme.colors.gradient1, theme.colors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={48} color={theme.colors.white} />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.roleBadge}>
            <MaterialIcons
              name={user.role === 'finder' ? 'search' : 'business'}
              size={16}
              color={theme.colors.white}
            />
            <Text style={styles.roleText}>{user.role === 'finder' ? 'Property Finder' : 'Property Owner'}</Text>
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            {!isEditing && (
              <Pressable onPress={() => setIsEditing(true)} style={styles.editButton}>
                <MaterialIcons name="edit" size={20} color={theme.colors.primary} />
                <Text style={styles.editText}>Edit</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.infoCard}>
            <Input
              label="Full Name"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              leftIcon="person"
              editable={isEditing}
              style={!isEditing && styles.disabledInput}
            />

            <View style={styles.infoItem}>
              <MaterialIcons name="phone" size={20} color={theme.colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Mobile Number</Text>
                <Text style={styles.infoValue}>{user.mobile || user.email || 'Not set'}</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={16} color={theme.colors.secondary} />
              </View>
            </View>

            <Input
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              leftIcon="email"
              keyboardType="email-address"
              editable={isEditing}
              style={!isEditing && styles.disabledInput}
            />

            <View style={styles.infoItem}>
              <MaterialIcons name="badge" size={20} color={theme.colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Account Type</Text>
                <Text style={styles.infoValue}>{user.role === 'finder' ? 'Property Finder' : 'Property Owner'}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="calendar-today" size={20} color={theme.colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          </View>

          {isEditing && (
            <View style={styles.editActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setIsEditing(false);
                  setName(user.name);
                  setEmail(user.email || '');
                }}
                variant="outline"
                style={styles.editActionButton}
              />
              <Button title="Save Changes" onPress={handleSave} variant="gradient" style={styles.editActionButton} />
            </View>
          )}
        </View>

        {/* Settings Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <Pressable style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="notifications" size={24} color={theme.colors.primary} />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.textLight} />
          </Pressable>

          <Pressable style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="lock" size={24} color={theme.colors.primary} />
              <Text style={styles.settingText}>Change Password</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.textLight} />
          </Pressable>

          <Pressable style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="language" size={24} color={theme.colors.primary} />
              <Text style={styles.settingText}>Language</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.textLight} />
          </Pressable>

          <Pressable style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="privacy-tip" size={24} color={theme.colors.primary} />
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.textLight} />
          </Pressable>

          <Pressable style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="description" size={24} color={theme.colors.primary} />
              <Text style={styles.settingText}>Terms & Conditions</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.textLight} />
          </Pressable>

          <Pressable style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="help" size={24} color={theme.colors.primary} />
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.textLight} />
          </Pressable>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>

          <Pressable onPress={handleLogout} style={styles.dangerItem}>
            <MaterialIcons name="logout" size={24} color={theme.colors.error} />
            <Text style={styles.dangerText}>Logout</Text>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.textLight} />
          </Pressable>

          <Pressable onPress={handleDeleteAccount} style={styles.dangerItem}>
            <MaterialIcons name="delete-forever" size={24} color={theme.colors.error} />
            <Text style={styles.dangerText}>Delete Account</Text>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.textLight} />
          </Pressable>
        </View>

        {/* Developer Settings */}
        <View style={styles.section}>
          <Pressable
            onPress={() => setShowDevSection((v) => !v)}
            style={styles.devToggle}
          >
            <View style={styles.settingLeft}>
              <MaterialIcons name="code" size={24} color="#7C3AED" />
              <View>
                <Text style={styles.settingText}>Developer Settings</Text>
                <Text style={styles.devSubtitle}>Configure Resend email API</Text>
              </View>
            </View>
            <View style={styles.devStatusRow}>
              <View style={[styles.statusDot, { backgroundColor: emailConfigured ? '#10B981' : '#F59E0B' }]} />
              <MaterialIcons
                name={showDevSection ? 'expand-less' : 'expand-more'}
                size={24}
                color={theme.colors.textLight}
              />
            </View>
          </Pressable>

          {showDevSection && (
            <View style={styles.devCard}>
              {/* Status banner */}
              <View style={[styles.statusBanner, { backgroundColor: emailConfigured ? '#ECFDF5' : '#FFFBEB' }]}>
                <MaterialIcons
                  name={emailConfigured ? 'check-circle' : 'warning'}
                  size={18}
                  color={emailConfigured ? '#10B981' : '#F59E0B'}
                />
                <Text style={[styles.statusText, { color: emailConfigured ? '#065F46' : '#92400E' }]}>
                  {emailConfigured
                    ? 'Real email OTP is active'
                    : EmailConfig.USE_MOCK_EMAIL
                    ? 'Mock mode enabled in config'
                    : 'No API key — using fallback OTP: 123456'}
                </Text>
              </View>

              <Text style={styles.devLabel}>Resend API Key</Text>
              <Text style={styles.devHint}>
                Get a free key at{' '}
                <Text style={styles.devLink}>resend.com/api-keys</Text>
              </Text>

              <View style={styles.apiKeyRow}>
                <TextInput
                  style={styles.apiKeyInput}
                  value={resendApiKey}
                  onChangeText={setResendApiKey}
                  placeholder="re_xxxxxxxxxxxxxxxxxxxx"
                  placeholderTextColor="#CBD5E1"
                  secureTextEntry={!showApiKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
                <Pressable
                  onPress={() => setShowApiKey((v) => !v)}
                  style={styles.eyeBtn}
                  hitSlop={8}
                >
                  <MaterialIcons
                    name={showApiKey ? 'visibility' : 'visibility-off'}
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </Pressable>
              </View>

              <View style={styles.devActions}>
                <Pressable
                  onPress={handleSaveApiKey}
                  disabled={savingKey}
                  style={({ pressed }) => [
                    styles.saveKeyBtn,
                    { opacity: pressed || savingKey ? 0.75 : 1 },
                  ]}
                >
                  <MaterialIcons name="save" size={18} color="#fff" />
                  <Text style={styles.saveKeyBtnText}>
                    {savingKey ? 'Saving...' : 'Save Key'}
                  </Text>
                </Pressable>

                {emailConfigured && (
                  <Pressable
                    onPress={handleClearApiKey}
                    style={styles.clearKeyBtn}
                  >
                    <MaterialIcons name="delete-outline" size={18} color={theme.colors.error} />
                    <Text style={styles.clearKeyBtnText}>Clear</Text>
                  </Pressable>
                )}
              </View>

              <Text style={styles.devFootnote}>
                Sender: <Text style={{ fontWeight: '600' }}>onboarding@resend.dev</Text>
                {' '}(works without domain setup)
              </Text>
            </View>
          )}
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>New Home Finder v1.0.0</Text>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.lg,
  },
  userName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  roleText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.white,
    fontWeight: theme.fontWeight.medium,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  editText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  verifiedBadge: {
    padding: theme.spacing.xs,
  },
  disabledInput: {
    opacity: 0.7,
  },
  editActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  editActionButton: {
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  settingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  dangerText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    fontWeight: theme.fontWeight.semibold,
  },
  versionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },

  // ── Developer section
  devToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  devSubtitle: {
    fontSize: 11,
    color: '#7C3AED',
    fontWeight: '500',
    marginTop: 2,
  },
  devStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  devCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    gap: 10,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  devLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  devHint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  devLink: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  apiKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    paddingHorizontal: 12,
    height: 50,
  },
  apiKeyInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: 'monospace' as any,
  },
  eyeBtn: {
    padding: 4,
  },
  devActions: {
    flexDirection: 'row',
    gap: 10,
  },
  saveKeyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 12,
  },
  saveKeyBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  clearKeyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: theme.colors.error,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  clearKeyBtnText: {
    color: theme.colors.error,
    fontWeight: '700',
    fontSize: 14,
  },
  devFootnote: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
});

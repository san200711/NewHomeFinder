import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { useAlert } from '@/template';

// ─── OTP Input ────────────────────────────────────────────────────────────────
function OTPInput({ value, onChange, accentColor }: { value: string; onChange: (v: string) => void; accentColor: string }) {
  return (
    <View style={otpStyles.row}>
      {Array(6).fill('').map((_, i) => (
        <View key={i} style={[otpStyles.box, value[i] ? { ...otpStyles.boxFilled, borderColor: accentColor } : otpStyles.boxEmpty]}>
          <Text style={otpStyles.digit}>{value[i] || ''}</Text>
        </View>
      ))}
      <TextInput
        style={otpStyles.hidden}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
      />
    </View>
  );
}

const otpStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, justifyContent: 'center', position: 'relative' },
  box: { width: 46, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  boxEmpty: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  boxFilled: { backgroundColor: '#EFF6FF' },
  digit: { fontSize: 22, fontWeight: '700', color: '#0F172A' },
  hidden: { position: 'absolute', opacity: 0, width: '100%', height: '100%' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role } = useLocalSearchParams<{ role: UserRole }>();
  const { sendOTP, verifyOTP, resetPassword } = useAuth();
  const { showAlert } = useAlert();

  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const accentColor = '#F59E0B';
  const gradientColors: [string, string] = ['#F59E0B', '#EF4444'];

  const startResendCooldown = () => {
    setResendCooldown(30);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async () => {
    if (!email.trim()) {
      showAlert('Missing Email', 'Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showAlert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const result = await sendOTP(email.trim().toLowerCase());
      if (!result.success) throw new Error(result.message);
      showAlert('Code Sent!', result.message.includes('123456') ? result.message : `A reset code was sent to ${email.trim()}.`);
      setStep('otp');
      startResendCooldown();
    } catch (error) {
      showAlert('Error', error instanceof Error ? error.message : 'Failed to send code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) {
      showAlert('Incomplete Code', 'Please enter all 6 digits.');
      return;
    }
    setLoading(true);
    try {
      const result = await verifyOTP(email.trim().toLowerCase(), otp);
      if (!result.success) {
        showAlert('Verification Failed', result.message);
        if (result.message.includes('Too many')) setOtp('');
        setLoading(false);
        return;
      }
      setStep('password');
    } catch {
      showAlert('Error', 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      showAlert('Missing Fields', 'Please fill in both password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      showAlert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim().toLowerCase(), otp, newPassword);
      showAlert('Password Reset!', 'Your password has been updated. Please login with your new password.');
      router.replace({ pathname: '/auth/login', params: { role } });
    } catch (error) {
      showAlert('Error', error instanceof Error ? error.message : 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const stepInfo = {
    email: { icon: 'lock-reset' as const, title: 'Forgot Password?', sub: 'Enter your email to receive a reset code' },
    otp: { icon: 'mark-email-unread' as const, title: 'Check Your Email', sub: `Enter the code sent to ${email}` },
    password: { icon: 'lock-open' as const, title: 'New Password', sub: 'Create a strong new password' },
  };
  const current = stepInfo[step];

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back */}
          <Pressable
            onPress={() => {
              if (step === 'email') router.back();
              else if (step === 'otp') { setStep('email'); setOtp(''); }
              else setStep('otp');
            }}
            style={styles.backBtn}
            hitSlop={12}
          >
            <MaterialIcons name="arrow-back" size={24} color="#0F172A" />
          </Pressable>

          {/* Progress */}
          <View style={styles.progressRow}>
            {(['email', 'otp', 'password'] as const).map((s, i) => (
              <View key={s} style={[styles.progressDot,
                s === step ? styles.progressDotActive :
                (['email', 'otp', 'password'].indexOf(step) > i ? styles.progressDotDone : styles.progressDotInactive)
              ]} />
            ))}
          </View>

          {/* Icon + Title */}
          <View style={styles.header}>
            <LinearGradient colors={gradientColors} style={styles.headerIcon}>
              <MaterialIcons name={current.icon} size={36} color="#fff" />
            </LinearGradient>
            <Text style={styles.headerTitle}>{current.title}</Text>
            <Text style={styles.headerSub}>{current.sub}</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Step 1 — Email */}
            {step === 'email' && (
              <>
                <View style={styles.fieldWrap}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={[styles.inputRow, focusedField === 'email' && { borderColor: accentColor, borderWidth: 2 }]}>
                    <MaterialIcons name="email" size={20} color={focusedField === 'email' ? accentColor : '#94A3B8'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="you@example.com"
                      placeholderTextColor="#CBD5E1"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>
                <Pressable onPress={handleSendOTP} disabled={loading} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
                  <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>{loading ? 'Sending...' : 'Send Reset Code'}</Text>
                    {!loading && <MaterialIcons name="send" size={18} color="#fff" style={{ marginLeft: 8 }} />}
                  </LinearGradient>
                </Pressable>
              </>
            )}

            {/* Step 2 — OTP */}
            {step === 'otp' && (
              <>
                <View style={styles.otpHint}>
                  <MaterialIcons name="info-outline" size={16} color="#64748B" />
                  <Text style={styles.otpHintText}>Enter the 6-digit code from your email.</Text>
                </View>
                <OTPInput value={otp} onChange={setOtp} accentColor={accentColor} />
                <Pressable onPress={handleVerifyOTP} disabled={loading || otp.length < 6} style={({ pressed }) => [{ opacity: pressed || otp.length < 6 ? 0.75 : 1 }]}>
                  <LinearGradient
                    colors={otp.length < 6 ? ['#CBD5E1', '#CBD5E1'] : gradientColors}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionBtnText}>{loading ? 'Verifying...' : 'Verify Code'}</Text>
                  </LinearGradient>
                </Pressable>
                <View style={styles.resendRow}>
                  <Text style={styles.resendLabel}>Didn't receive it? </Text>
                  <Pressable onPress={() => { setOtp(''); handleSendOTP(); }} disabled={resendCooldown > 0 || loading}>
                    <Text style={[styles.resendLink, { color: resendCooldown > 0 ? '#94A3B8' : accentColor }]}>
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}

            {/* Step 3 — New Password */}
            {step === 'password' && (
              <>
                <View style={styles.fieldWrap}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={[styles.inputRow, focusedField === 'pw' && { borderColor: accentColor, borderWidth: 2 }]}>
                    <MaterialIcons name="lock" size={20} color={focusedField === 'pw' ? accentColor : '#94A3B8'} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="At least 6 characters"
                      placeholderTextColor="#CBD5E1"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPw}
                      autoCapitalize="none"
                      onFocus={() => setFocusedField('pw')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <Pressable onPress={() => setShowPw((v) => !v)} hitSlop={8}>
                      <MaterialIcons name={showPw ? 'visibility' : 'visibility-off'} size={20} color="#94A3B8" />
                    </Pressable>
                  </View>
                </View>
                <View style={styles.fieldWrap}>
                  <Text style={styles.label}>Confirm New Password</Text>
                  <View style={[styles.inputRow, focusedField === 'cpw' && { borderColor: accentColor, borderWidth: 2 }]}>
                    <MaterialIcons name="lock" size={20} color={focusedField === 'cpw' ? accentColor : '#94A3B8'} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="Re-enter new password"
                      placeholderTextColor="#CBD5E1"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPw}
                      autoCapitalize="none"
                      onFocus={() => setFocusedField('cpw')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <Pressable onPress={() => setShowConfirmPw((v) => !v)} hitSlop={8}>
                      <MaterialIcons name={showConfirmPw ? 'visibility' : 'visibility-off'} size={20} color="#94A3B8" />
                    </Pressable>
                  </View>
                </View>
                <Pressable onPress={handleResetPassword} disabled={loading} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
                  <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>{loading ? 'Resetting...' : 'Reset Password'}</Text>
                    {!loading && <MaterialIcons name="check" size={20} color="#fff" style={{ marginLeft: 8 }} />}
                  </LinearGradient>
                </Pressable>
              </>
            )}
          </View>

          {/* Back to login */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Remembered your password? </Text>
            <Pressable onPress={() => router.replace({ pathname: '/auth/login', params: { role } })}>
              <Text style={[styles.bottomLink, { color: accentColor }]}>Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F4FF' },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 8, padding: 4 },
  progressRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 24 },
  progressDot: { width: 8, height: 8, borderRadius: 4 },
  progressDotActive: { width: 24, backgroundColor: '#F59E0B', borderRadius: 4 },
  progressDotDone: { backgroundColor: '#10B981' },
  progressDotInactive: { backgroundColor: '#CBD5E1' },
  header: { alignItems: 'center', marginBottom: 24 },
  headerIcon: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
  },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  headerSub: { fontSize: 14, color: '#64748B', textAlign: 'center' },
  card: {
    backgroundColor: '#fff', borderRadius: 28, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 10,
    gap: 16,
  },
  fieldWrap: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginLeft: 2 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0',
    paddingHorizontal: 14, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#0F172A' },
  actionBtn: {
    height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
    shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  actionBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  otpHint: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12 },
  otpHintText: { fontSize: 13, color: '#64748B', flex: 1 },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  resendLabel: { fontSize: 13, color: '#64748B' },
  resendLink: { fontSize: 13, fontWeight: '700' },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  bottomText: { fontSize: 14, color: '#64748B' },
  bottomLink: { fontSize: 14, fontWeight: '700' },
});

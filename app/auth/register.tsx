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
import { Image } from 'expo-image';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { useAlert } from '@/template';

const BG_IMAGE =
  'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=1200&auto=format&fit=crop&q=80';

// ─── OTP Input ────────────────────────────────────────────────────────────────
function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const digits = Array(6).fill('');
  const filled = value.split('');

  return (
    <View style={otpStyles.row}>
      {digits.map((_, i) => (
        <View
          key={i}
          style={[otpStyles.box, filled[i] ? otpStyles.boxFilled : otpStyles.boxEmpty]}
        >
          <Text style={otpStyles.digit}>{filled[i] || ''}</Text>
        </View>
      ))}
      {/* Hidden real input */}
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
  box: {
    width: 46,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  boxEmpty: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  boxFilled: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  digit: { fontSize: 22, fontWeight: '700', color: '#0F172A' },
  hidden: { position: 'absolute', opacity: 0, width: '100%', height: '100%' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role } = useLocalSearchParams<{ role: UserRole }>();
  const { register, sendOTP, verifyOTP } = useAuth();
  const { showAlert } = useAlert();

  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const isOwner = role === 'owner';
  const gradientColors: [string, string] = isOwner ? ['#7C3AED', '#2563EB'] : ['#2563EB', '#06B6D4'];
  const accentColor = isOwner ? '#7C3AED' : '#2563EB';

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
    if (!name.trim() || !email.trim() || !password || !confirmPw) {
      showAlert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showAlert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (password !== confirmPw) {
      showAlert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      showAlert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const result = await sendOTP(email.trim().toLowerCase());
      if (!result.success) throw new Error(result.message);
      showAlert(
        'Code Sent!',
        result.message.includes('123456')
          ? result.message
          : `A 6-digit verification code was sent to ${email.trim()}.`
      );
      setStep('otp');
      startResendCooldown();
    } catch (error) {
      showAlert('Error', error instanceof Error ? error.message : 'Failed to send code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      const result = await sendOTP(email.trim().toLowerCase());
      showAlert('Code Resent', result.message);
      startResendCooldown();
    } catch {
      showAlert('Error', 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async () => {
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
      await register(email.trim().toLowerCase(), password, name.trim(), role);
      showAlert('Account Created!', 'Welcome to New Home Finder.');
      router.replace('/dashboard');
    } catch (error) {
      showAlert('Error', error instanceof Error ? error.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const FieldInput = ({
    fieldKey,
    icon,
    label,
    placeholder,
    value,
    onChange,
    secure,
    showToggle,
    onToggle,
    keyboardType,
  }: any) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          focusedField === fieldKey && { borderColor: accentColor, borderWidth: 2 },
        ]}
      >
        <MaterialIcons name={icon} size={20} color={focusedField === fieldKey ? accentColor : '#94A3B8'} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, showToggle && { flex: 1 }]}
          placeholder={placeholder}
          placeholderTextColor="#CBD5E1"
          value={value}
          onChangeText={onChange}
          secureTextEntry={secure}
          autoCapitalize={fieldKey === 'name' ? 'words' : 'none'}
          autoCorrect={false}
          keyboardType={keyboardType || 'default'}
          onFocus={() => setFocusedField(fieldKey)}
          onBlur={() => setFocusedField(null)}
        />
        {showToggle && (
          <Pressable onPress={onToggle} hitSlop={8}>
            <MaterialIcons name={secure ? 'visibility-off' : 'visibility'} size={20} color="#94A3B8" />
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Image source={{ uri: BG_IMAGE }} style={StyleSheet.absoluteFillObject} contentFit="cover" transition={300} />
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.75)']}
        style={StyleSheet.absoluteFillObject}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back */}
          <Pressable onPress={() => (step === 'otp' ? setStep('form') : router.back())} style={styles.backBtn} hitSlop={12}>
            <View style={styles.backBtnInner}>
              <MaterialIcons name="arrow-back" size={22} color="#fff" />
            </View>
          </Pressable>

          {/* Hero */}
          <View style={styles.hero}>
            <LinearGradient colors={gradientColors} style={styles.roleIcon}>
              <MaterialIcons name={isOwner ? 'business' : 'person-add'} size={36} color="#fff" />
            </LinearGradient>
            <Text style={styles.heroRole}>{isOwner ? 'Property Owner' : 'Property Finder'}</Text>
            <Text style={styles.heroTitle}>
              {step === 'form' ? 'Create Account' : 'Verify Email'}
            </Text>
            <Text style={styles.heroSub}>
              {step === 'form' ? 'Join thousands of happy users' : `Code sent to ${email}`}
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {step === 'form' ? (
              <>
                <FieldInput
                  fieldKey="name" icon="person" label="Full Name"
                  placeholder="John Smith" value={name} onChange={setName}
                />
                <FieldInput
                  fieldKey="email" icon="email" label="Email Address"
                  placeholder="you@example.com" value={email} onChange={setEmail}
                  keyboardType="email-address"
                />
                <FieldInput
                  fieldKey="password" icon="lock" label="Password"
                  placeholder="At least 6 characters" value={password} onChange={setPassword}
                  secure={!showPw} showToggle onToggle={() => setShowPw((v) => !v)}
                />
                <FieldInput
                  fieldKey="confirm" icon="lock" label="Confirm Password"
                  placeholder="Re-enter password" value={confirmPw} onChange={setConfirmPw}
                  secure={!showConfirmPw} showToggle onToggle={() => setShowConfirmPw((v) => !v)}
                />

                <Pressable
                  onPress={handleSendOTP}
                  disabled={loading}
                  style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                >
                  <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionBtnText}>
                      {loading ? 'Sending Code...' : 'Send Verification Code'}
                    </Text>
                    {!loading && <MaterialIcons name="send" size={18} color="#fff" style={{ marginLeft: 8 }} />}
                  </LinearGradient>
                </Pressable>

                <View style={styles.loginRow}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <Pressable onPress={() => router.push({ pathname: '/auth/login', params: { role } })}>
                    <Text style={[styles.loginLink, { color: accentColor }]}>Sign In</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                {/* OTP step */}
                <View style={styles.otpHeader}>
                  <View style={[styles.otpIconWrap, { backgroundColor: accentColor + '15' }]}>
                    <MaterialIcons name="mark-email-unread" size={36} color={accentColor} />
                  </View>
                  <Text style={styles.otpTitle}>Check Your Inbox</Text>
                  <Text style={styles.otpSub}>Enter the 6-digit code we sent to your email.</Text>
                </View>

                <OTPInput value={otp} onChange={setOtp} />

                <Pressable
                  onPress={handleVerifyAndRegister}
                  disabled={loading || otp.length < 6}
                  style={({ pressed }) => [{ opacity: pressed || otp.length < 6 ? 0.75 : 1 }]}
                >
                  <LinearGradient
                    colors={otp.length < 6 ? ['#CBD5E1', '#CBD5E1'] : gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionBtnText}>
                      {loading ? 'Verifying...' : 'Verify & Create Account'}
                    </Text>
                  </LinearGradient>
                </Pressable>

                <View style={styles.resendRow}>
                  <Text style={styles.resendLabel}>Didn't receive it? </Text>
                  <Pressable onPress={handleResendOTP} disabled={resendCooldown > 0 || loading}>
                    <Text style={[styles.resendLink, { color: resendCooldown > 0 ? '#94A3B8' : accentColor }]}>
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 8 },
  backBtnInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { alignItems: 'center', paddingVertical: 28 },
  roleIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  heroRole: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.65)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
  heroTitle: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 6 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    gap: 14,
  },
  fieldWrap: { gap: 5 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginLeft: 2 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#0F172A' },
  actionBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 4,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  actionBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: 14, color: '#64748B' },
  loginLink: { fontSize: 14, fontWeight: '700' },
  // OTP
  otpHeader: { alignItems: 'center', gap: 8 },
  otpIconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  otpTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  otpSub: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20 },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  resendLabel: { fontSize: 13, color: '#64748B' },
  resendLink: { fontSize: 13, fontWeight: '700' },
});

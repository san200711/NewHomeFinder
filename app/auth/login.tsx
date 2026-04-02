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
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { theme } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { useAlert } from '@/template';

const BG_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role } = useLocalSearchParams<{ role: UserRole }>();
  const { login } = useAuth();
  const { showAlert } = useAlert();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const isOwner = role === 'owner';

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert('Missing Fields', 'Please fill in your email and password.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showAlert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password, role);
      router.replace('/dashboard');
    } catch (error) {
      showAlert('Login Failed', error instanceof Error ? error.message : 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const accentColor = isOwner ? '#7C3AED' : '#2563EB';
  const gradientColors: [string, string] = isOwner
    ? ['#7C3AED', '#2563EB']
    : ['#2563EB', '#06B6D4'];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {/* Background image */}
      <Image
        source={{ uri: BG_IMAGE }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
        style={StyleSheet.absoluteFillObject}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
          {/* Back */}
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <View style={styles.backBtnInner}>
              <MaterialIcons name="arrow-back" size={22} color="#fff" />
            </View>
          </Pressable>

          {/* Hero */}
          <View style={styles.hero}>
            <LinearGradient colors={gradientColors} style={styles.roleIcon}>
              <MaterialIcons
                name={isOwner ? 'business' : 'search'}
                size={36}
                color="#fff"
              />
            </LinearGradient>
            <Text style={styles.heroRole}>
              {isOwner ? 'Property Owner' : 'Property Finder'}
            </Text>
            <Text style={styles.heroTitle}>Welcome Back! 👋</Text>
            <Text style={styles.heroSub}>Sign in to continue</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Email */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email Address</Text>
              <View
                style={[
                  styles.inputRow,
                  focusedField === 'email' && { borderColor: accentColor, borderWidth: 2 },
                ]}
              >
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

            {/* Password */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.inputRow,
                  focusedField === 'password' && { borderColor: accentColor, borderWidth: 2 },
                ]}
              >
                <MaterialIcons name="lock" size={20} color={focusedField === 'password' ? accentColor : '#94A3B8'} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Your password"
                  placeholderTextColor="#CBD5E1"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                  <MaterialIcons
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color="#94A3B8"
                  />
                </Pressable>
              </View>
            </View>

            {/* Forgot */}
            <Pressable
              onPress={() => router.push({ pathname: '/auth/forgot-password', params: { role } })}
              style={styles.forgotWrap}
            >
              <Text style={[styles.forgotText, { color: accentColor }]}>Forgot Password?</Text>
            </Pressable>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            >
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginBtn}
              >
                {loading ? (
                  <Text style={styles.loginBtnText}>Signing in...</Text>
                ) : (
                  <>
                    <Text style={styles.loginBtnText}>Sign In</Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                  </>
                )}
              </LinearGradient>
            </Pressable>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Don't have an account?</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register link */}
            <Pressable
              onPress={() => router.push({ pathname: '/auth/register', params: { role } })}
              style={({ pressed }) => [styles.registerBtn, { opacity: pressed ? 0.75 : 1, borderColor: accentColor }]}
            >
              <Text style={[styles.registerBtnText, { color: accentColor }]}>Create an Account</Text>
            </Pressable>
          </View>
          </ScrollView>
        </TouchableWithoutFeedback>
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
  hero: { alignItems: 'center', paddingVertical: 32 },
  roleIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  heroRole: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  heroTitle: { fontSize: 30, fontWeight: '700', color: '#fff', marginBottom: 6 },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.65)' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    gap: 16,
  },
  fieldWrap: { gap: 6 },
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
  forgotWrap: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { fontSize: 13, fontWeight: '600' },
  loginBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  registerBtn: {
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerBtnText: { fontSize: 15, fontWeight: '700' },
});

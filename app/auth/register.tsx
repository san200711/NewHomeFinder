import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ImageBackground } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { useAlert } from '@/template';

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!name || !email || !password || !confirmPassword) {
      showAlert('Error', 'Please fill in all fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert('Error', 'Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      showAlert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await sendOTP(email);
      showAlert('Verification Code Sent', 'Please check your email for the verification code');
      setStep('otp');
    } catch (error) {
      showAlert('Error', error instanceof Error ? error.message : 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    if (!otp) {
      showAlert('Error', 'Please enter verification code');
      return;
    }

    setLoading(true);
    try {
      const isValid = await verifyOTP(email, otp);
      if (!isValid) {
        showAlert('Error', 'Invalid verification code');
        setLoading(false);
        return;
      }

      await register(email, password, name, role);
      showAlert('Success', 'Registration successful!');
      router.replace('/dashboard');
    } catch (error) {
      showAlert('Registration Failed', error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=1200&auto=format&fit=crop&q=80' }}
      style={styles.container}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(37, 99, 235, 0.9)', 'rgba(59, 130, 246, 0.85)']}
        style={[styles.gradient, { paddingTop: insets.top }]}
      >
        <Pressable
          onPress={() => {
            if (step === 'otp') {
              setStep('form');
            } else {
              router.back();
            }
          }}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.white} />
        </Pressable>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name={role === 'finder' ? 'search' : 'business'} size={60} color={theme.colors.white} />
            </View>
            <Text style={styles.title}>
              {role === 'finder' ? 'Property Finder' : 'Property Owner'} Registration
            </Text>
            <Text style={styles.subtitle}>
              {step === 'form' ? 'Create your account to get started' : 'Enter verification code sent to your email'}
            </Text>
          </View>

          {step === 'form' ? (
            <View style={styles.form}>
              <Input
                label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              leftIcon="person"
              />

              <Input
                label="Email Address"
                placeholder="Enter your email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                leftIcon="email"
                autoCapitalize="none"
              />

              <Input
                label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon="lock"
              autoCapitalize="none"
              />

              <Input
                label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              leftIcon="lock"
              autoCapitalize="none"
              />

              <Button
                title="Send Verification Code"
                onPress={handleSendOTP}
                loading={loading}
                variant="gradient"
                size="large"
              />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <Pressable onPress={() => router.push({ pathname: '/auth/login', params: { role } })}>
                  <Text style={styles.link}>Login</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.form}>
              <Input
                label="Enter Verification Code"
                placeholder="Enter 6-digit code"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                leftIcon="security"
                maxLength={6}
              />

              <Text style={styles.hint}>Code sent to {email}</Text>

              <Button
                title="Verify and Register"
                onPress={handleVerifyAndRegister}
                loading={loading}
                variant="gradient"
                size="large"
              />

              <Pressable onPress={handleSendOTP} disabled={loading}>
                <Text style={[styles.resend, loading && { opacity: 0.5 }]}>Resend Code</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  backButton: {
    padding: theme.spacing.md,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    marginTop: theme.spacing.md,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.95)',
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  hint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: -theme.spacing.xs,
  },
  resend: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  link: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
});

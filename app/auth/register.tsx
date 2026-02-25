import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!name || !mobile || !password || !confirmPassword) {
      showAlert('Error', 'Please fill in all fields');
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
      await sendOTP(mobile);
      showAlert('OTP Sent', 'Please check your mobile for OTP (Use: 123456)');
      setStep('otp');
    } catch (error) {
      showAlert('Error', 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    if (!otp) {
      showAlert('Error', 'Please enter OTP');
      return;
    }

    setLoading(true);
    try {
      const isValid = await verifyOTP(mobile, otp);
      if (!isValid) {
        showAlert('Error', 'Invalid OTP');
        setLoading(false);
        return;
      }

      await register(mobile, password, name, role);
      showAlert('Success', 'Registration successful!');
      router.replace('/dashboard');
    } catch (error) {
      showAlert('Registration Failed', error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
        <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
      </Pressable>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <MaterialIcons name={role === 'finder' ? 'search' : 'business'} size={60} color={theme.colors.primary} />
          <Text style={styles.title}>
            {role === 'finder' ? 'Property Finder' : 'Property Owner'} Registration
          </Text>
          <Text style={styles.subtitle}>
            {step === 'form' ? 'Create your account to get started' : 'Enter OTP sent to your mobile'}
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
              label="Mobile Number"
              placeholder="Enter your mobile number"
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
              leftIcon="phone"
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
              title="Send OTP"
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
              label="Enter OTP"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              leftIcon="security"
              maxLength={6}
            />

            <Text style={styles.hint}>OTP sent to {mobile}</Text>

            <Button
              title="Verify and Register"
              onPress={handleVerifyAndRegister}
              loading={loading}
              variant="gradient"
              size="large"
            />

            <Pressable onPress={handleSendOTP}>
              <Text style={styles.resend}>Resend OTP</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    padding: theme.spacing.md,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  form: {
    gap: theme.spacing.md,
  },
  hint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
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

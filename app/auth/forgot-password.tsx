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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role } = useLocalSearchParams<{ role: UserRole }>();
  const { sendOTP, verifyOTP, resetPassword } = useAuth();
  const { showAlert } = useAlert();

  const [step, setStep] = useState<'mobile' | 'otp' | 'password'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!mobile) {
      showAlert('Error', 'Please enter mobile number');
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

  const handleVerifyOTP = async () => {
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
      setStep('password');
    } catch (error) {
      showAlert('Error', 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      showAlert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      showAlert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(mobile, otp, newPassword);
      showAlert('Success', 'Password reset successful!');
      router.replace({ pathname: '/auth/login', params: { role } });
    } catch (error) {
      showAlert('Error', 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Pressable
        onPress={() => {
          if (step === 'mobile') {
            router.back();
          } else if (step === 'otp') {
            setStep('mobile');
          } else {
            setStep('otp');
          }
        }}
        style={styles.backButton}
      >
        <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
      </Pressable>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <MaterialIcons name="lock-reset" size={60} color={theme.colors.primary} />
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            {step === 'mobile' && 'Enter your mobile number to reset password'}
            {step === 'otp' && 'Enter OTP sent to your mobile'}
            {step === 'password' && 'Create a new password'}
          </Text>
        </View>

        {step === 'mobile' && (
          <View style={styles.form}>
            <Input
              label="Mobile Number"
              placeholder="Enter your mobile number"
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
              leftIcon="phone"
              autoCapitalize="none"
            />

            <Button
              title="Send OTP"
              onPress={handleSendOTP}
              loading={loading}
              variant="gradient"
              size="large"
            />
          </View>
        )}

        {step === 'otp' && (
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
              title="Verify OTP"
              onPress={handleVerifyOTP}
              loading={loading}
              variant="gradient"
              size="large"
            />

            <Pressable onPress={handleSendOTP}>
              <Text style={styles.resend}>Resend OTP</Text>
            </Pressable>
          </View>
        )}

        {step === 'password' && (
          <View style={styles.form}>
            <Input
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              leftIcon="lock"
              autoCapitalize="none"
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              leftIcon="lock"
              autoCapitalize="none"
            />

            <Button
              title="Reset Password"
              onPress={handleResetPassword}
              loading={loading}
              variant="gradient"
              size="large"
            />
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
});

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/types';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      router.push({
        pathname: '/auth/login',
        params: { role: selectedRole },
      });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[theme.colors.gradient1, theme.colors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <MaterialIcons name="home-work" size={80} color={theme.colors.white} />
            <Text style={styles.appName}>New Home Finder</Text>
            <Text style={styles.tagline}>Find Your Dream Property</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Choose Your Role</Text>
            <Text style={styles.sectionDescription}>Select how you want to use the app</Text>

            <View style={styles.roleCards}>
              <RoleCard
                role="finder"
                title="Property Finder"
                description="Search and find your dream home or land"
                icon="search"
                selected={selectedRole === 'finder'}
                onSelect={() => setSelectedRole('finder')}
              />
              <RoleCard
                role="owner"
                title="Property Owner"
                description="List and manage your properties"
                icon="business"
                selected={selectedRole === 'owner'}
                onSelect={() => setSelectedRole('owner')}
              />
            </View>

            <View style={styles.actions}>
              <Button
                title="Continue"
                onPress={handleContinue}
                disabled={!selectedRole}
                size="large"
                style={styles.button}
              />
              <Text style={styles.footerText}>
                By continuing, you agree to our Terms & Privacy Policy
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

function RoleCard({
  role,
  title,
  description,
  icon,
  selected,
  onSelect,
}: {
  role: UserRole;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable onPress={onSelect} style={[styles.roleCard, selected && styles.roleCardSelected]}>
      <View style={[styles.roleIconContainer, selected && styles.roleIconContainerSelected]}>
        <MaterialIcons name={icon} size={40} color={selected ? theme.colors.white : theme.colors.primary} />
      </View>
      <Text style={[styles.roleTitle, selected && styles.roleTitleSelected]}>{title}</Text>
      <Text style={[styles.roleDescription, selected && styles.roleDescriptionSelected]}>{description}</Text>
      {selected && (
        <View style={styles.checkmark}>
          <MaterialIcons name="check-circle" size={24} color={theme.colors.primary} />
        </View>
      )}
    </Pressable>
  );
}

import { Pressable } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  appName: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    marginTop: theme.spacing.lg,
  },
  tagline: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.white,
    marginTop: theme.spacing.sm,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sectionDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  roleCards: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  roleCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    position: 'relative',
  },
  roleCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#EFF6FF',
  },
  roleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  roleIconContainerSelected: {
    backgroundColor: theme.colors.primary,
  },
  roleTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  roleTitleSelected: {
    color: theme.colors.primary,
  },
  roleDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  roleDescriptionSelected: {
    color: theme.colors.text,
  },
  checkmark: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
  },
  actions: {
    gap: theme.spacing.md,
  },
  button: {
    width: '100%',
  },
  footerText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

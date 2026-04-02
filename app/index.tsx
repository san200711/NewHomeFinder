import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { UserRole } from '@/types';

const BG_IMAGE =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&auto=format&fit=crop&q=80';

const FEATURES = [
  { icon: 'search' as const, label: 'Smart Search' },
  { icon: 'map' as const, label: 'Map View' },
  { icon: 'star' as const, label: 'Reviews' },
  { icon: 'favorite' as const, label: 'Favorites' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleContinue = () => {
    if (!selectedRole) return;
    router.push({ pathname: '/auth/login', params: { role: selectedRole } });
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Background */}
      <Image
        source={{ uri: BG_IMAGE }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={400}
      />
      <LinearGradient
        colors={['rgba(15,23,42,0.5)', 'rgba(15,23,42,0.2)', 'rgba(15,23,42,0.85)']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero top */}
        <View style={styles.heroTop}>
          <LinearGradient colors={['#2563EB', '#7C3AED']} style={styles.logoWrap}>
            <MaterialIcons name="home-work" size={36} color="#fff" />
          </LinearGradient>
          <Text style={styles.appName}>New Home Finder</Text>
          <Text style={styles.tagline}>Your Dream Property Awaits</Text>

          {/* Feature chips */}
          <View style={styles.featuresRow}>
            {FEATURES.map((f) => (
              <View key={f.label} style={styles.featureChip}>
                <MaterialIcons name={f.icon} size={14} color="#fff" />
                <Text style={styles.featureLabel}>{f.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom card */}
        <View style={styles.card}>
          {/* Pill indicator */}
          <View style={styles.pill} />

          <Text style={styles.cardTitle}>Get Started</Text>
          <Text style={styles.cardSub}>Choose how you want to use the app</Text>

          {/* Role Cards */}
          <View style={styles.rolesRow}>
            <RoleCard
              role="finder"
              label="Property Finder"
              description="Search & discover properties"
              icon="search"
              gradient={['#2563EB', '#06B6D4']}
              selected={selectedRole === 'finder'}
              onSelect={() => setSelectedRole('finder')}
            />
            <RoleCard
              role="owner"
              label="Property Owner"
              description="List & manage properties"
              icon="business"
              gradient={['#7C3AED', '#EC4899']}
              selected={selectedRole === 'owner'}
              onSelect={() => setSelectedRole('owner')}
            />
          </View>

          {/* CTA Button */}
          <Pressable
            onPress={handleContinue}
            disabled={!selectedRole}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          >
            <LinearGradient
              colors={
                selectedRole === 'owner'
                  ? ['#7C3AED', '#EC4899']
                  : selectedRole === 'finder'
                  ? ['#2563EB', '#06B6D4']
                  : ['#CBD5E1', '#CBD5E1']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.ctaBtn, !selectedRole && { opacity: 0.6 }]}
            >
              <Text style={styles.ctaBtnText}>
                {selectedRole ? `Continue as ${selectedRole === 'finder' ? 'Finder' : 'Owner'}` : 'Select a Role'}
              </Text>
              {selectedRole ? (
                <MaterialIcons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
              ) : null}
            </LinearGradient>
          </Pressable>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>New here? </Text>
            <Pressable
              onPress={() => {
                if (selectedRole) router.push({ pathname: '/auth/register', params: { role: selectedRole } });
                else showNoRoleHint();
              }}
            >
              <Text style={styles.registerLink}>Create Account</Text>
            </Pressable>
          </View>

          <Text style={styles.terms}>
            By continuing you agree to our Terms of Service & Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function showNoRoleHint() {
  // gentle no-op — user must pick role first
}

function RoleCard({
  label,
  description,
  icon,
  gradient,
  selected,
  onSelect,
}: {
  role: UserRole;
  label: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  gradient: [string, string];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [
        styles.roleCard,
        selected && styles.roleCardSelected,
        { opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <LinearGradient
        colors={selected ? gradient : ['#F1F5F9', '#F1F5F9']}
        style={styles.roleIconWrap}
      >
        <MaterialIcons name={icon} size={28} color={selected ? '#fff' : '#64748B'} />
      </LinearGradient>
      <Text style={[styles.roleLabel, selected && { color: gradient[0] }]}>{label}</Text>
      <Text style={styles.roleDesc}>{description}</Text>
      {selected && (
        <View style={[styles.checkBadge, { backgroundColor: gradient[0] }]}>
          <MaterialIcons name="check" size={12} color="#fff" />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { flexGrow: 1 },

  heroTop: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 32 },
  logoWrap: {
    width: 76, height: 76, borderRadius: 38,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 12,
  },
  appName: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 6 },
  tagline: { fontSize: 16, color: 'rgba(255,255,255,0.75)', marginBottom: 20 },
  featuresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  featureChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  featureLabel: { fontSize: 12, fontWeight: '600', color: '#fff' },

  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 36, borderTopRightRadius: 36,
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40,
    shadowColor: '#000', shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 16,
  },
  pill: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
  cardTitle: { fontSize: 24, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  cardSub: { fontSize: 14, color: '#64748B', marginBottom: 20 },

  rolesRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleCard: {
    flex: 1, backgroundColor: '#F8FAFC', borderRadius: 20, padding: 16,
    borderWidth: 2, borderColor: '#E2E8F0', position: 'relative',
    alignItems: 'flex-start',
  },
  roleCardSelected: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  roleIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  roleLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  roleDesc: { fontSize: 12, color: '#64748B', lineHeight: 16 },
  checkBadge: {
    position: 'absolute', top: 12, right: 12,
    width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },

  ctaBtn: {
    height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', marginBottom: 16,
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  ctaBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  registerText: { fontSize: 14, color: '#64748B' },
  registerLink: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
  terms: { fontSize: 11, color: '#94A3B8', textAlign: 'center', lineHeight: 16 },
});

// src/components/ui.js
import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { theme, radius, space } from '../core/theme';

export function Button({ title, onPress, variant = 'primary', disabled }) {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8}
      style={[styles.btn, isPrimary && styles.btnPrimary, isGhost && styles.btnGhost,
        isDanger && styles.btnDanger, disabled && styles.btnDisabled]}>
      <Text style={[styles.btnText, isPrimary && { color: '#0F1714' },
        (isGhost || isDanger) && { color: theme.text }]}>{title}</Text>
    </TouchableOpacity>
  );
}
export function Card({ children, style }) { return <View style={[styles.card, style]}>{children}</View>; }
export function Eyebrow({ children }) { return <Text style={styles.eyebrow}>{children}</Text>; }

const styles = StyleSheet.create({
  btn: { paddingVertical: 14, paddingHorizontal: space.lg, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: theme.gold },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.border },
  btnDanger: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.danger },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  card: { backgroundColor: theme.surface, borderRadius: radius.lg, borderWidth: 1,
    borderColor: theme.border, padding: space.md },
  eyebrow: { color: theme.goldDim, fontSize: 12, fontWeight: '700', letterSpacing: 2,
    textTransform: 'uppercase' },
});

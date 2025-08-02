import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  // Datos de ejemplo
  const settingsOptions = [
    { id: 'profile', title: 'Perfil', icon: 'person-circle-outline', type: 'navigation' },
    { id: 'notifications', title: 'Notificaciones', icon: 'notifications-outline', type: 'switch', value: true },
    { id: 'theme', title: 'Tema', icon: 'color-palette-outline', type: 'navigation' },
    { id: 'language', title: 'Idioma', icon: 'language-outline', type: 'navigation' },
    { id: 'daily-goal', title: 'Meta diaria', icon: 'flag-outline', type: 'navigation' },
    { id: 'data', title: 'Datos y almacenamiento', icon: 'cloud-download-outline', type: 'navigation' },
    { id: 'about', title: 'Acerca de', icon: 'information-circle-outline', type: 'navigation' },
    { id: 'logout', title: 'Cerrar sesión', icon: 'log-out-outline', type: 'action', color: '#FF3B30' },
  ];

  const renderSettingItem = (item: any) => {
    return (
      <TouchableOpacity key={item.id} style={styles.itemContainer}>
        <Ionicons name={item.icon} size={24} color={item.color || '#FF9933'} style={styles.icon} />
        <Text style={[styles.itemTitle, { color: item.color || '#333' }]}>{item.title}</Text>
        <Ionicons name="chevron-forward-outline" size={22} color="#C7C7CC" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ajustes</Text>
      </View>
      <ScrollView>
        <View style={styles.section}>
          {settingsOptions.map(renderSettingItem)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginTop: 35,
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  icon: {
    marginRight: 16,
  },
  itemTitle: {
    flex: 1,
    fontSize: 17,
  },
});

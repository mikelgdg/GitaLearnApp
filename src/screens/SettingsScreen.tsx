import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gitaDataService } from '../services/GitaDataService';
import { AppSettings } from '../types';

// Componente reutilizable para una fila de ajuste
const SettingRow = ({ icon, title, children }: any) => (
  <View style={styles.itemContainer}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={20} color="white" />
    </View>
    <Text style={styles.itemTitle}>{title}</Text>
    <View>{children}</View>
  </View>
);

// Componente para una sección de ajustes
const SettingsSection = ({ title, children }: any) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const loadedSettings = await gitaDataService.getAppSettings();
    setSettings(loadedSettings);
  };

  const handleSettingChange = async (key: keyof AppSettings, value: any) => {
    if (settings) {
      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);
      await gitaDataService.saveAppSettings(updatedSettings);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Borrar todos los datos',
      '¿Estás seguro? Esta acción es irreversible y borrará todo tu progreso.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar datos',
          style: 'destructive',
          onPress: async () => {
            await gitaDataService.clearAllData();
            Alert.alert('Datos borrados', 'Se ha reiniciado tu progreso.');
            loadSettings();
          },
        },
      ]
    );
  };

  if (!settings) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Cargando ajustes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ajustes</Text>
        </View>

        <SettingsSection title="Estudio">
          <SettingRow icon="book-outline" title="Versos por sesión">
            <View style={styles.pickerContainer}>
              {[10, 20, 30].map(num => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.pickerOption,
                    settings.versesPerSession === num && styles.pickerOptionSelected,
                  ]}
                  onPress={() => handleSettingChange('versesPerSession', num)}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      settings.versesPerSession === num && styles.pickerTextSelected,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </SettingRow>
          <SettingRow icon="notifications-outline" title="Recordatorios diarios">
            <Switch
              value={settings.dailyReminder}
              onValueChange={value => handleSettingChange('dailyReminder', value)}
              trackColor={{ false: '#767577', true: '#FFC99D' }}
              thumbColor={settings.dailyReminder ? '#FF9933' : '#f4f3f4'}
            />
          </SettingRow>
        </SettingsSection>

        <SettingsSection title="Apariencia">
          <SettingRow icon="color-palette-outline" title="Tema de la app">
            <Text style={styles.comingSoonText}>Próximamente</Text>
          </SettingRow>
        </SettingsSection>

        <SettingsSection title="Datos">
          <TouchableOpacity onPress={handleClearData}>
            <SettingRow icon="trash-outline" title="Borrar todo el progreso">
              <Ionicons name="chevron-forward" size={22} color="#C7C7CC" />
            </SettingRow>
          </TouchableOpacity>
        </SettingsSection>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>GitaLearn v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#666',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 20,
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
    marginTop: 25,
    marginHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D6D72',
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 15,
  },
  sectionBody: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FF9933',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemTitle: {
    flex: 1,
    fontSize: 17,
    color: '#333',
  },
  pickerContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFEFF4',
    borderRadius: 8,
    padding: 2,
  },
  pickerOption: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  pickerOptionSelected: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pickerText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  pickerTextSelected: {
    color: '#FF9933',
  },
  comingSoonText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
});

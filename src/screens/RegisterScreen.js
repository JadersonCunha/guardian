import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import AuthService from '../services/AuthService';

export default function RegisterScreen({ onRegisterComplete, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pin: '',
    confirmPin: ''
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Digite seu nome');
      return false;
    }
    
    if (!formData.email.trim()) {
      Alert.alert('Erro', 'Digite seu email');
      return false;
    }
    
    if (!formData.phone.trim()) {
      Alert.alert('Erro', 'Digite seu telefone');
      return false;
    }
    
    if (formData.pin.length !== 4) {
      Alert.alert('Erro', 'PIN deve ter 4 dígitos');
      return false;
    }
    
    if (formData.pin !== formData.confirmPin) {
      Alert.alert('Erro', 'PINs não coincidem');
      return false;
    }
    
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const result = await AuthService.registerUser(formData);
    
    if (result.success) {
      Alert.alert(
        '✅ Cadastro Realizado!', 
        'Sua conta foi criada com sucesso. Agora você pode fazer login.',
        [
          { text: 'OK', onPress: onRegisterComplete }
        ]
      );
    } else {
      Alert.alert('Erro', result.error || 'Erro ao criar conta');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Guardian</Text>
        <Text style={styles.subtitle}>Criar sua conta segura</Text>
        
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Dados Pessoais</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Seu nome completo"
            value={formData.name}
            onChangeText={(text) => updateField('name', text)}
            autoCapitalize="words"
            autoFocus={true}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Seu email"
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Seu telefone (com DDD)"
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text)}
            keyboardType="phone-pad"
          />
          
          <Text style={styles.sectionTitle}>Criar PIN de Segurança</Text>
          <Text style={styles.pinInfo}>Escolha 4 números que só você saiba</Text>
          
          <TextInput
            style={styles.pinInput}
            placeholder="PIN (4 dígitos)"
            value={formData.pin}
            onChangeText={(text) => updateField('pin', text)}
            secureTextEntry
            keyboardType="numeric"
            maxLength={4}
            selectTextOnFocus={true}
          />
          
          <TextInput
            style={styles.pinInput}
            placeholder="Confirme seu PIN"
            value={formData.confirmPin}
            onChangeText={(text) => updateField('confirmPin', text)}
            secureTextEntry
            keyboardType="numeric"
            maxLength={4}
            selectTextOnFocus={true}
          />
          
          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
            <Text style={styles.btnText}>🔐 Criar Conta</Text>
          </TouchableOpacity>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>🔒 Seus dados estão seguros</Text>
            <Text style={styles.infoText}>• Todas as informações são criptografadas</Text>
            <Text style={styles.infoText}>• Dados ficam apenas no seu celular</Text>
            <Text style={styles.infoText}>• PIN é usado para proteger o app</Text>
          </View>

          {onSwitchToLogin && (
            <TouchableOpacity 
              style={styles.loginLinkBtn} 
              onPress={onSwitchToLogin}>
              <Text style={styles.loginLinkText}>Já tenho uma conta</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 10,
    borderRadius: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2d3436',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#636e72',
    textAlign: 'center',
    marginBottom: 40,
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
    marginTop: 20,
    marginBottom: 5,
  },
  pinInfo: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  pinInput: {
    borderWidth: 1.5,
    borderColor: '#0984e3',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 20,
    backgroundColor: '#f8f9fa',
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: 'bold',
  },
  registerBtn: {
    backgroundColor: '#00b894',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
  },
  btnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00b894',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#636e72',
    marginBottom: 3,
  },
  loginLinkBtn: {
    marginTop: 20,
    padding: 10,
  },
  loginLinkText: {
    color: '#74b9ff',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
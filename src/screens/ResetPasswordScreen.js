import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AuthService from '../services/AuthService';

export default function ResetPasswordScreen({ onPasswordReset }) {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (newPin.length !== 4) {
      Alert.alert('PIN Inválido', 'O novo PIN deve ter exatamente 4 dígitos.');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('PINs não coincidem', 'Os PINs digitados são diferentes. Tente novamente.');
      return;
    }

    setIsLoading(true);
    try {
      // Esta função precisa ser criada no seu AuthService
      const result = await AuthService.resetUserPin(newPin);

      if (result.success) {
        Alert.alert(
          '✅ Sucesso!',
          'Seu PIN foi redefinido. Agora você pode entrar com o novo PIN.',
          [{ text: 'OK', onPress: onPasswordReset }]
        );
      } else {
        throw new Error(result.error || 'Não foi possível redefinir o PIN.');
      }
    } catch (error) {
      Alert.alert('❌ Erro', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🔑 Redefinir PIN</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>
          Crie um novo PIN de 4 dígitos para acessar o aplicativo.
        </Text>

        <TextInput
          style={styles.pinInput}
          placeholder="Novo PIN (4 dígitos)"
          value={newPin}
          onChangeText={setNewPin}
          secureTextEntry
          keyboardType="numeric"
          maxLength={4}
          autoFocus={true}
        />

        <TextInput
          style={styles.pinInput}
          placeholder="Confirme o novo PIN"
          value={confirmPin}
          onChangeText={setConfirmPin}
          secureTextEntry
          keyboardType="numeric"
          maxLength={4}
        />

        <TouchableOpacity 
          style={[styles.saveBtn, isLoading && styles.disabledBtn]} 
          onPress={handleResetPassword}
          disabled={isLoading}
        >
          <Text style={styles.btnText}>
            {isLoading ? 'Salvando...' : 'Salvar Novo PIN'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#2d3436',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  instruction: {
    fontSize: 16,
    color: '#2d3436',
    textAlign: 'center',
    marginBottom: 30,
  },
  pinInput: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 20,
    borderWidth: 2,
    borderColor: '#0984e3',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 8,
  },
  saveBtn: {
    backgroundColor: '#00b894',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#636e72',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
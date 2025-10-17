import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import AuthService from '../services/AuthService';

export default function LoginScreen({ userData, onLoginSuccess, onForgotPassword, onGoBack }) {
  const [pin, setPin] = useState('');
  const pinInputRef = useRef(null);

  const handleLogin = async () => {
    const isValid = await AuthService.authenticateUser(pin);
    
    if (isValid) {
      onLoginSuccess();
    } else {
      Alert.alert('❌ Erro', 'PIN incorreto. Tente novamente.');
      setPin('');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Guardian</Text>
      <Text style={styles.subtitle}>Bem-vinda de volta!</Text>
      
      <View style={styles.loginBox}>
        <Text style={styles.instruction}>Digite seu PIN para entrar:</Text>
        <Text style={styles.userInfo}>👤 {userData?.name}</Text>
        
        <TextInput
          style={styles.pinInput}
          placeholder="Toque para digitar seu PIN"
          value={pin}
          onChangeText={setPin}
          secureTextEntry
          keyboardType="numeric"
          maxLength={4}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />
        
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.btnText}>🔓 Entrar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.forgotBtn} 
          onPress={onForgotPassword}
        >
          <Text style={styles.forgotText}>Esqueceu a Senha?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeBtn} onPress={onGoBack}>
          <Text style={styles.closeText}>✕ Voltar</Text>
        </TouchableOpacity>
        
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 5,
    borderRadius: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#636e72',
    marginBottom: 40,
    textAlign: 'center',
  },
  loginBox: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    width: '90%',
    alignItems: 'center',
    elevation: 5,
  },
  instruction: {
    fontSize: 16,
    color: '#2d3436',
    marginBottom: 10,
    textAlign: 'center',
  },
  userInfo: {
    fontSize: 14,
    color: '#00b894',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  pinInput: {
    backgroundColor: '#f1f2f6',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#0984e3',
    letterSpacing: 5,
    minHeight: 50,
  },
  loginBtn: {
    backgroundColor: '#0984e3',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotBtn: {
    marginTop: 20,
    padding: 10,
  },
  forgotText: {
    color: '#74b9ff',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  closeBtn: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#d63031',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
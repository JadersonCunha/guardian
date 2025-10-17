import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function AuthChoiceScreen({ onNavigateToLogin, onNavigateToRegister }) {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Guardian</Text>
      <Text style={styles.subtitle}>Sua proteção começa aqui.</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.loginBtn}
          onPress={onNavigateToLogin}
        >
          <Text style={styles.btnText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.registerBtn}
          onPress={onNavigateToRegister}
        >
          <Text style={styles.btnText}>Criar Conta</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>
        Um aplicativo para sua segurança e bem-estar.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
    borderRadius: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#636e72',
    marginBottom: 60,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  loginBtn: {
    backgroundColor: '#0984e3',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
  },
  registerBtn: {
    backgroundColor: '#00b894',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  btnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    position: 'absolute',
    bottom: 40,
    fontSize: 14,
    color: '#636e72',
    textAlign: 'center',
  },
});
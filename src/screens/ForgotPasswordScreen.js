import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AuthService from '../services/AuthService';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendRecoveryEmail = async () => {
    if (!email.trim()) {
      Alert.alert('⚠️ Atenção', 'Digite seu email para recuperar o PIN');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('⚠️ Email inválido', 'Digite um email válido');
      return;
    }

    setIsLoading(true);

    try {
      const userData = await AuthService.getUserData();
      
      if (!userData || userData.email.toLowerCase() !== email.toLowerCase()) {
        Alert.alert('❌ Email não encontrado', 'Este email não está cadastrado no app');
        setIsLoading(false);
        return;
      }

      await sendPasswordResetRequest(email);
      
      Alert.alert(
        '✅ Email enviado!', 
        `Enviamos instruções para ${email}. Verifique sua caixa de entrada e spam.`,
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );

    } catch (error) {
      Alert.alert('❌ Erro', 'Não foi possível enviar o email. Tente novamente.');
    }

    setIsLoading(false);
  };

  const sendPasswordResetRequest = async (email) => {
    console.log(`SIMULAÇÃO: Pedido de redefinição de senha para ${email}`); 
    const deepLink = 'guardian://reset-password'; 
    console.log(`SIMULAÇÃO: O link enviado seria: ${deepLink}`);
    
    return new Promise(resolve => {
      setTimeout(() => resolve({ success: true }), 1000);
    });
  };

  const resetAppData = () => {
    Alert.alert(
      '⚠️ Resetar App',
      'Isso vai apagar TODOS os seus dados e você precisará se cadastrar novamente. Tem certeza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'SIM, RESETAR', style: 'destructive', onPress: async () => {
          await AuthService.clearAllData();
          Alert.alert('✅ App resetado!', 'Agora você pode se cadastrar novamente.');
          navigation.goBack();
        }}
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔑 Recuperar PIN</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>
          Digite o email que você usou no cadastro:
        </Text>

        <TextInput
          style={styles.emailInput}
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity 
          style={[styles.sendBtn, isLoading && styles.disabledBtn]} 
          onPress={sendRecoveryEmail}
          disabled={isLoading}
        >
          <Text style={styles.btnText}>
            {isLoading ? '📧 Enviando...' : '📧 Enviar Email'}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <Text style={styles.dividerText}>ou</Text>
        </View>

        <TouchableOpacity style={styles.resetBtn} onPress={resetAppData}>
          <Text style={styles.resetBtnText}>🗑️ Resetar App Completamente</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Como funciona:</Text>
          <Text style={styles.infoText}>• Enviamos um email com um link seguro.</Text>
          <Text style={styles.infoText}>• Verifique sua caixa de entrada e spam</Text>
          <Text style={styles.infoText}>• Clique no link para abrir o app na tela de redefinição.</Text>
          <Text style={styles.infoText}>• Crie um novo PIN e pronto!</Text>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#2d3436',
  },
  backBtn: {
    fontSize: 16,
    color: '#74b9ff',
    marginRight: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instruction: {
    fontSize: 16,
    color: '#2d3436',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  emailInput: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#74b9ff',
    marginBottom: 20,
  },
  sendBtn: {
    backgroundColor: '#00b894',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledBtn: {
    backgroundColor: '#636e72',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerText: {
    color: '#636e72',
    fontSize: 14,
  },
  resetBtn: {
    backgroundColor: '#e17055',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  resetBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 5,
    lineHeight: 20,
  },
});
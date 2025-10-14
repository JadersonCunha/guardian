import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import ContactService from '../services/ContactService';

export default function CameraScreen({ navigation }) {
  const [isRecording, setIsRecording] = useState(false);

  const openCamera = () => {
    Alert.alert(
      '📹 Gravar Evidências',
      'Escolha o tipo de evidência:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: '📷 Foto', onPress: () => openNativeCamera('photo') },
        { text: '🎥 Vídeo', onPress: () => openNativeCamera('video') },
        { text: '🎤 Áudio', onPress: () => openVoiceRecorder() }
      ]
    );
  };

  const openNativeCamera = (type) => {
    Alert.alert(
      '📱 Câmera',
      `Abra o app de ${type === 'photo' ? 'Câmera' : 'Câmera (vídeo)'} do seu celular para gravar evidências. Depois compartilhe com seus contatos de emergência.`,
      [
        { text: 'Entendi', style: 'default' }
      ]
    );
  };

  const openVoiceRecorder = () => {
    Alert.alert(
      '🎤 Gravador de Áudio',
      'Abra o app Gravador de Voz do seu celular para gravar áudio. Depois compartilhe com seus contatos de emergência.',
      [
        { text: 'Entendi', style: 'default' }
      ]
    );
  };

  const sendEmergencyMessage = async () => {
    const contacts = await ContactService.getEmergencyContacts();
    if (contacts.length === 0) {
      Alert.alert('⚠️ Atenção', 'Adicione contatos de emergência primeiro!');
      return;
    }

    const phone = contacts[0].phone;
    const message = '🚨 EMERGÊNCIA - Estou gravando evidências. Preciso de ajuda AGORA!';
    const whatsappUrl = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
    
    try {
      await Linking.openURL(whatsappUrl);
    } catch (error) {
      Alert.alert('Erro', 'WhatsApp não encontrado. Instale o WhatsApp para enviar mensagens.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📹 Evidências</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Grave evidências importantes para sua segurança:
        </Text>

        <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
          <Text style={styles.buttonIcon}>📱</Text>
          <Text style={styles.buttonText}>Abrir Câmera/Gravador</Text>
          <Text style={styles.buttonSubtext}>Foto, vídeo ou áudio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.emergencyButton} onPress={sendEmergencyMessage}>
          <Text style={styles.buttonIcon}>🚨</Text>
          <Text style={styles.buttonText}>Avisar Contatos</Text>
          <Text style={styles.buttonSubtext}>Enviar alerta de emergência</Text>
        </TouchableOpacity>

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>💡 Como usar:</Text>
          <Text style={styles.instructionText}>1. Toque em "Abrir Câmera/Gravador"</Text>
          <Text style={styles.instructionText}>2. Escolha foto, vídeo ou áudio</Text>
          <Text style={styles.instructionText}>3. Grave suas evidências</Text>
          <Text style={styles.instructionText}>4. Compartilhe com seus contatos</Text>
          <Text style={styles.instructionText}>5. Use "Avisar Contatos" para alertar</Text>
        </View>
      </View>
    </View>
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
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    color: '#2d3436',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  cameraButton: {
    backgroundColor: '#e17055',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    elevation: 5,
  },
  emergencyButton: {
    backgroundColor: '#d63031',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
    elevation: 5,
  },
  buttonIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 5,
  },
  buttonSubtext: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  instructions: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    elevation: 3,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 15,
  },
  instructionText: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 8,
    lineHeight: 20,
  },
});
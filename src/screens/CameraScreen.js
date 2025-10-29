import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import * as Sharing from 'expo-sharing';
import ContactService from '../services/ContactService';

export default function CameraScreen({ navigation }) {
  const [recording, setRecording] = useState(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);

  const openEvidenceRecorder = () => {
    Alert.alert(
      '📹 Gravar Evidências',
      'Escolha o tipo de evidência:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: '📷 Tirar Foto', onPress: takePhoto, disabled: isRecordingAudio },
        { text: '🎥 Gravar Vídeo', onPress: recordVideo, disabled: isRecordingAudio },
        { text: '🎤 Gravar Áudio', onPress: startRecording }
      ]
    );
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à câmera para tirar fotos.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      shareEvidenceWithContacts(result.assets[0].uri, 'foto');
    }
  };

  const recordVideo = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à câmera para gravar vídeos.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
    });

    if (!result.canceled) {
      shareEvidenceWithContacts(result.assets[0].uri, 'vídeo');
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de acesso ao microfone para gravar áudio.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Iniciando gravação de áudio...');
      const { recording } = await Audio.Recording.createAsync(
         Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecordingAudio(true);
      console.log('Gravação iniciada.');
    } catch (err) {
      console.error('Falha ao iniciar gravação', err);
      Alert.alert('Erro', 'Não foi possível iniciar a gravação de áudio.');
    }
  };

  const stopRecording = async () => {
    console.log('Parando gravação...');
    setIsRecordingAudio(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI(); 
    setRecording(null);
    console.log('Gravação parada. URI:', uri);
    if (uri) {
      shareEvidenceWithContacts(uri, 'áudio');
    }
  };

  const shareEvidence = async (uri) => {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Compartilhamento indisponível', 'Seu dispositivo não permite compartilhar arquivos.');
      return;
    }
    await Sharing.shareAsync(uri);
  };

  const shareEvidenceWithContacts = async (uri, mediaType) => {
    Alert.alert(
      '📤 Enviar Evidência?',
      `A evidência (${mediaType}) foi salva. Deseja compartilhá-la agora com seus contatos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim, Compartilhar', onPress: () => {
            shareEvidence(uri);
        }}
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
        <Image source={require('../../assets/logo.png')} style={styles.headerLogo} />
        <Text style={styles.title}>📹 Evidências</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.description}>
          Grave evidências importantes para sua segurança:
        </Text>

        {isRecordingAudio ? (
          <TouchableOpacity style={[styles.cameraButton, styles.stopButton]} onPress={stopRecording}>
            <Text style={styles.buttonIcon}>🛑</Text>
            <Text style={styles.buttonText}>Parar Gravação</Text>
            <Text style={styles.buttonSubtext}>Toque para finalizar e compartilhar</Text>
          </TouchableOpacity>
        ) : ( 
          <TouchableOpacity style={styles.cameraButton} onPress={openEvidenceRecorder}>
            <Text style={styles.buttonIcon}>📱</Text>
            <Text style={styles.buttonText}>Abrir Câmera/Gravador</Text>
            <Text style={styles.buttonSubtext}>Foto, vídeo ou áudio</Text>
          </TouchableOpacity>
        )}
        

        <TouchableOpacity style={styles.emergencyButton} onPress={sendEmergencyMessage}>
          <Text style={styles.buttonIcon}>🚨</Text>
          <Text style={styles.buttonText}>Avisar Contatos</Text>
          <Text style={styles.buttonSubtext}>Enviar alerta de emergência</Text>
        </TouchableOpacity>

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>💡 Como usar:</Text>
          <Text style={styles.instructionText}>1. Toque em "Abrir Câmera/Gravador".</Text>
          <Text style={styles.instructionText}>2. Escolha foto, vídeo ou áudio.</Text>
          <Text style={styles.instructionText}>3. Grave suas evidências</Text>
          <Text style={styles.instructionText}>4. Compartilhe com seus contatos</Text>
          <Text style={styles.instructionText}>5. Use "Avisar Contatos" para alertar</Text>
        </View>
      </ScrollView>
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
  headerLogo: {
    width: 24,
    height: 24,
    marginRight: 10,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40, // Espaço extra no final
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
  stopButton: {
    backgroundColor: '#f1c40f',
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
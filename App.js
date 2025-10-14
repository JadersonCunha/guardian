import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import RightsScreen from './src/screens/RightsScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AuthService from './src/services/AuthService';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pin, setPin] = useState('');
  const [currentScreen, setCurrentScreen] = useState('home');
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [userExists, setUserExists] = useState(null); // null = carregando, true = existe, false = não existe
  const [userData, setUserData] = useState(null);
  const pinInputRef = useRef(null);

  useEffect(() => {
    checkUserExists();
  }, []);

  const checkUserExists = async () => {
    const exists = await AuthService.userExists();
    setUserExists(exists);
    
    if (exists) {
      const user = await AuthService.getUserData();
      setUserData(user);
    }
  };

  const handleLogin = async () => {
    const isValid = await AuthService.authenticateUser(pin);
    
    if (isValid) {
      setIsLoggedIn(true);
      Alert.alert('✅ Sucesso!', `Bem-vinda, ${userData?.name || 'usuária'}!`);
    } else {
      Alert.alert('❌ Erro', 'PIN incorreto. Tente novamente.');
      setPin('');
    }
  };

  const handleRegisterComplete = () => {
    checkUserExists(); // Recarrega dados do usuário
  };

  const addDefaultContact = () => {
    const defaultContact = {
      id: Date.now().toString(),
      name: 'Suporte Guardian',
      phone: '51985330121'
    };
    setContacts([defaultContact]);
    Alert.alert('✅ Pronto!', 'Contato adicionado! As mensagens serão enviadas via WhatsApp.');
  };

  const handleEmergency = async () => {
    // Busca contatos salvos
    const ContactService = require('./src/services/ContactService').default;
    const savedContacts = await ContactService.getEmergencyContacts();
    
    if (savedContacts.length === 0) {
      Alert.alert('⚠️ Atenção', 'Adicione um contato de emergência primeiro!');
      return;
    }

    Alert.alert(
      '🚨 ATIVAR EMERGÊNCIA?',
      `Isso vai abrir o WhatsApp para: ${savedContacts[0].phone}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'SIM, PRECISO DE AJUDA!', style: 'destructive', onPress: async () => {
          const EmergencyService = require('./src/services/EmergencyService').default;
          const result = await EmergencyService.activateEmergency();
          Alert.alert(
            result.success ? '✅ Emergência Ativada!' : '❌ Erro',
            result.message
          );
        }}
      ]
    );
  };

  // Tela de Cadastro (primeira vez)
  if (userExists === false) {
    return <RegisterScreen onRegisterComplete={handleRegisterComplete} />;
  }

  // Tela de Login
  if (userExists === true && !isLoggedIn) {
    return (
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Text style={styles.title}>🛡️ Guardian</Text>
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
            onPress={() => setCurrentScreen('forgot')}
          >
            <Text style={styles.forgotText}>Esqueceu o PIN?</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Loading (enquanto verifica se usuário existe)
  if (userExists === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🛡️ Guardian</Text>
        <Text style={styles.subtitle}>Carregando...</Text>
      </View>
    );
  }

  // Tela de Contatos
  if (currentScreen === 'contacts') {
    const ContactsScreen = require('./src/screens/ContactsScreen').default;
    return <ContactsScreen navigation={{ goBack: () => setCurrentScreen('home') }} />;
  }

  // Tela de Câmera
  if (currentScreen === 'camera') {
    const CameraScreen = require('./src/screens/CameraScreen').default;
    return <CameraScreen navigation={{ goBack: () => setCurrentScreen('home') }} />;
  }

  // Tela de Recuperação de Senha
  if (currentScreen === 'forgot') {
    const ForgotPasswordScreen = require('./src/screens/ForgotPasswordScreen').default;
    return <ForgotPasswordScreen navigation={{ goBack: () => setCurrentScreen('home') }} />;
  }

  // Tela de Locais Seguros
  if (currentScreen === 'safe-places') {
    const SafePlacesScreen = require('./src/screens/SafePlacesScreen').default;
    return <SafePlacesScreen navigation={{ goBack: () => setCurrentScreen('home') }} />;
  }

  // Tela de Direitos
  if (currentScreen === 'rights') {
    return <RightsScreen navigation={{ goBack: () => setCurrentScreen('home') }} />;
  }

  // Tela Principal
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛡️ Guardian</Text>
      <Text style={styles.welcome}>Você está protegida!</Text>
      
      <TouchableOpacity style={styles.emergencyBtn} onPress={handleEmergency}>
        <Text style={styles.emergencyText}>🚨</Text>
        <Text style={styles.emergencyLabel}>SOS</Text>
      </TouchableOpacity>

      <View style={styles.menu}>
        <TouchableOpacity 
          style={styles.menuBtn}
          onPress={() => setCurrentScreen('contacts')}
        >
          <Text style={styles.menuText}>📞 Contatos de Emergência</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cameraBtn}
          onPress={() => setCurrentScreen('camera')}
        >
          <Text style={styles.menuText}>📹 Gravar Evidências</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuBtn}
          onPress={() => setCurrentScreen('safe-places')}
        >
          <Text style={styles.menuText}>📍 Locais Seguros</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuBtn}
          onPress={() => setCurrentScreen('rights')}
        >
          <Text style={styles.menuText}>📚 Meus Direitos</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutBtn} 
        onPress={() => {
          setIsLoggedIn(false);
          setPin('');
        }}
      >
        <Text style={styles.btnText}>🚪 Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  backBtn: {
    fontSize: 16,
    color: '#0984e3',
    marginRight: 20,
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
    marginBottom: 40,
    textAlign: 'center',
  },
  welcome: {
    fontSize: 18,
    color: '#00b894',
    marginBottom: 30,
    fontWeight: '600',
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
  emergencyBtn: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#d63031',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    elevation: 8,
  },
  emergencyText: {
    fontSize: 40,
    marginBottom: 5,
  },
  emergencyLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  menu: {
    width: '100%',
    marginBottom: 20,
  },
  menuBtn: {
    backgroundColor: '#00b894',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 3,
  },
  cameraBtn: {
    backgroundColor: '#e17055',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 3,
  },
  menuText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: '#636e72',
    padding: 12,
    borderRadius: 10,
    width: '60%',
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotBtn: {
    marginTop: 15,
    padding: 10,
  },
  forgotText: {
    color: '#74b9ff',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#636e72',
    marginBottom: 30,
  },
  addBtn: {
    backgroundColor: '#6c5ce7',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  contactsList: {
    width: '100%',
    marginTop: 20,
  },
  contactCard: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 15,
    color: '#636e72',
  },
});
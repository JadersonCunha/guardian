import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, KeyboardAvoidingView, Platform, Image } from 'react-native';
import * as Linking from 'expo-linking';
import RightsScreen from './src/screens/RightsScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import LoginScreen from './src/screens/LoginScreen'; // Import the new LoginScreen
import AuthChoiceScreen from './src/screens/AuthChoiceScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import AuthService from './src/services/AuthService';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pin, setPin] = useState('');
  const [currentScreen, setCurrentScreen] = useState('home');
  const [contacts, setContacts] = useState([]);
  const [userExists, setUserExists] = useState(null); // null = carregando, true = existe, false = não existe
  const [userData, setUserData] = useState(null);
  const [currentAuthView, setCurrentAuthView] = useState('loading'); // 'loading', 'choice', 'login', 'register', 'forgot'
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true); // Novo estado
  const [deepLink, setDeepLink] = useState(null);
  const pinInputRef = useRef(null);

  useEffect(() => {
    // Roda apenas uma vez para verificar o usuário
    checkUserExists();

    // Listener para deep links com o app já aberto
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Verifica se o app foi aberto por um deep link
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => subscription.remove();
  }, []);

  const checkUserExists = async () => {
    // Garante que a tela de carregamento seja exibida
    setUserExists(null); 
    setShowWelcomeScreen(true);
    const exists = await AuthService.userExists();
    setUserExists(exists);
    
    if (exists) {
      const user = await AuthService.getUserData();
      setUserData(user);
    }

    setCurrentAuthView('choice'); // Sempre começa na tela de escolha

    // Esconde a tela de carregamento/boas-vindas após a verificação
    // Usamos um timeout para a transição ser mais suave
    setTimeout(() => setShowWelcomeScreen(false), 1500);
  };

  const handleDeepLink = (url) => {
    const { path } = Linking.parse(url);
    if (path === 'reset-password') {
      setDeepLink('reset-password');
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    Alert.alert('✅ Sucesso!', `Bem-vinda de volta, ${userData?.name || 'usuária'}!`);
  };

  const handleRegisterComplete = () => {
    checkUserExists();
    setCurrentAuthView('choice'); // Após o registro, volta para a tela de escolha
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

  // Tela de Carregamento / Boas-vindas
  if (showWelcomeScreen) {
    return (
      <View style={styles.container}>
        <Image source={require('./assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Guardian</Text>
        <Text style={styles.subtitle}>{userExists === null ? 'Carregando...' : 'Bem-vinda!'}</Text>
      </View>
    );
  }

  // Prioridade máxima: se um deep link de reset de senha foi detectado
  if (deepLink === 'reset-password') {
    return <ResetPasswordScreen onPasswordReset={() => {
      setDeepLink(null); // Limpa o deep link
      setIsLoggedIn(false); // Garante que o usuário não está logado
      setCurrentAuthView('choice'); // Volta para a tela de escolha
    }} />;
  }

  // Tela de Cadastro (primeira vez)
  if (!isLoggedIn && !showWelcomeScreen) {
    switch (currentAuthView) {
      case 'choice':
        return (
          <AuthChoiceScreen
            onNavigateToLogin={() => {
              if (userExists) {
                setCurrentAuthView('login');
              } else {
                Alert.alert('Nenhuma conta encontrada', 'Por favor, crie uma conta primeiro.', [
                  { text: 'OK', onPress: () => setCurrentAuthView('register') }
                ]);
              }
            }}
            onNavigateToRegister={() => setCurrentAuthView('register')}
          />
        );
      case 'login':
        return (
          <LoginScreen
            userData={userData}
            onLoginSuccess={handleLoginSuccess}
            onForgotPassword={() => setCurrentAuthView('forgot')}
            onGoBack={() => setCurrentAuthView('choice')}
          />
        );
      case 'register':
        return <RegisterScreen onRegisterComplete={handleRegisterComplete} onSwitchToLogin={() => setCurrentAuthView('login')} />;
      default: // 'loading'
        return null; // A tela de carregamento já foi mostrada
      case 'forgot':
        return <ForgotPasswordScreen navigation={{ goBack: () => setCurrentAuthView('choice') }} />;

    }
  }

  // Loading (enquanto verifica se usuário existe)
  if (userExists === null) {
    return (
      <View style={styles.container}>
        <Image source={require('./assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Guardian</Text>
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
      <Image source={require('./assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Guardian</Text>
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
          setCurrentAuthView('choice'); // Ao sair, volta para a tela de escolha
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
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 20,
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
  welcome: {
    fontSize: 16,
    color: '#00b894',
    marginBottom: 20,
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
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#d63031',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    elevation: 8,
  },
  emergencyText: {
    fontSize: 30,
    marginBottom: 3,
  },
  emergencyLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  menu: {
    width: '100%',
    marginBottom: 15,
  },
  menuBtn: {
    backgroundColor: '#00b894',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 3,
  },
  cameraBtn: {
    backgroundColor: '#e17055',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 3,
  },
  menuText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: '#636e72',
    padding: 10,
    borderRadius: 8,
    width: '50%',
    alignItems: 'center',
    marginTop: 10,
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
  closeBtn: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#d63031',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  emptyContainer: { // emptyContainer e addBtn não são usados aqui, mas mantidos por enquanto
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
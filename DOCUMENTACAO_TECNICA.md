# Safe Guardian - Documentação Técnica Completa

## 📋 Índice
1. [Visão Geral do Projeto](#visão-geral)
2. [Arquitetura Técnica](#arquitetura)
3. [Tecnologias Utilizadas](#tecnologias)
4. [Estrutura do Código](#estrutura)
5. [Funcionalidades Implementadas](#funcionalidades)
6. [Fluxo de Desenvolvimento](#desenvolvimento)
7. [Problemas Encontrados e Soluções](#problemas)
8. [Segurança e Privacidade](#segurança)
9. [Como Expandir o App](#expansão)

---

## 🎯 Visão Geral do Projeto

### Objetivo
Desenvolver um aplicativo móvel discreto e seguro para auxiliar mulheres em situações de violência doméstica, oferecendo recursos de emergência, documentação e rede de apoio.

### Público-Alvo
- Mulheres em situação de vulnerabilidade
- Pessoas que precisam de um sistema de emergência discreto
- Familiares e amigos que querem oferecer suporte

### Proposta de Valor
- **Discrição**: Interface que não chama atenção
- **Rapidez**: Ativação de emergência em poucos toques
- **Confiabilidade**: Funciona offline e em situações críticas
- **Segurança**: Dados protegidos e criptografados

---

## 🏗️ Arquitetura Técnica

### Padrão Arquitetural
```
┌─────────────────┐
│   APRESENTAÇÃO  │ ← Telas (UI/UX)
├─────────────────┤
│     LÓGICA      │ ← Serviços e Estados
├─────────────────┤
│     DADOS       │ ← Armazenamento Local
└─────────────────┘
```

### Componentes Principais

#### 1. **Interface do Usuário (UI)**
- **React Native**: Framework multiplataforma
- **Componentes nativos**: TouchableOpacity, View, Text
- **Navegação**: Stack Navigator (React Navigation)
- **Estilização**: StyleSheet nativo

#### 2. **Gerenciamento de Estado**
- **useState**: Estado local dos componentes
- **useEffect**: Ciclo de vida e efeitos colaterais
- **Props**: Comunicação entre componentes

#### 3. **Armazenamento de Dados**
- **Expo SecureStore**: Armazenamento criptografado
- **AsyncStorage**: Cache local (alternativa)
- **JSON**: Formato de serialização

#### 4. **APIs Nativas**
- **Expo Location**: Geolocalização GPS
- **Expo SMS**: Envio de mensagens
- **Expo Local Authentication**: Biometria

---

## 🛠️ Tecnologias Utilizadas

### Core Technologies
```javascript
{
  "expo": "~54.0.0",           // Plataforma de desenvolvimento
  "react": "18.2.0",           // Biblioteca UI
  "react-native": "0.74.5"     // Framework mobile
}
```

### Dependências Principais
```javascript
{
  "expo-location": "GPS e geolocalização",
  "expo-sms": "Envio de SMS",
  "expo-secure-store": "Armazenamento seguro",
  "expo-local-authentication": "Biometria",
  "@react-navigation/native": "Navegação",
  "@react-navigation/stack": "Stack de telas"
}
```

### Ferramentas de Desenvolvimento
- **Expo CLI**: Ferramenta de build e deploy
- **Expo Go**: App para testes em dispositivos
- **Metro Bundler**: Empacotador JavaScript
- **Node.js**: Runtime JavaScript

---

## 📁 Estrutura do Código

### Organização de Arquivos
```
guardian-app/
├── App.js                    # Componente principal
├── package.json              # Dependências e scripts
├── app.json                  # Configurações do Expo
├── assets/                   # Imagens e recursos
│   ├── icon.png
│   ├── splash.png
│   └── favicon.png
└── src/                      # Código fonte
    ├── screens/              # Telas do app
    │   └── ContactsScreen.js
    └── services/             # Lógica de negócio
        ├── ContactService.js
        └── EmergencyService.js
```

### Componente Principal (App.js)
```javascript
// Estrutura básica do componente
export default function App() {
  // Estados do aplicativo
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home');
  
  // Funções de controle
  const handleLogin = () => { /* lógica de login */ };
  const handleEmergency = () => { /* lógica de emergência */ };
  
  // Renderização condicional
  if (!isLoggedIn) return <LoginScreen />;
  if (currentScreen === 'contacts') return <ContactsScreen />;
  return <HomeScreen />;
}
```

---

## ⚙️ Funcionalidades Implementadas

### 1. **Sistema de Autenticação**

#### Autenticação por PIN
```javascript
const handleLogin = () => {
  if (pin === '1234') {
    setIsLoggedIn(true);
    Alert.alert('✅ Sucesso!', 'Bem-vinda ao Guardian!');
  } else {
    Alert.alert('❌ Erro', 'PIN incorreto. Tente: 1234');
    setPin('');
  }
};
```

**Características:**
- PIN fixo de 4 dígitos (1234)
- Validação local
- Feedback visual imediato
- Limpeza automática em caso de erro

#### Biometria (Planejada)
```javascript
// Implementação futura
const authenticateWithBiometrics = async () => {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Use sua digital para entrar',
    fallbackLabel: 'Usar PIN'
  });
  return result.success;
};
```

### 2. **Gerenciamento de Contatos**

#### Estrutura de Dados
```javascript
const contact = {
  id: `contact_${Date.now()}`,    // ID único
  name: 'Nome da Pessoa',         // Nome do contato
  phone: '51985330121',           // Telefone
  addedAt: new Date().toISOString() // Data de criação
};
```

#### Operações CRUD
```javascript
// CREATE - Adicionar contato
const addContact = async (newContact) => {
  const contacts = await getContacts();
  contacts.push(newContact);
  await SecureStore.setItemAsync('contacts', JSON.stringify(contacts));
};

// READ - Listar contatos
const getContacts = async () => {
  const data = await SecureStore.getItemAsync('contacts');
  return data ? JSON.parse(data) : [];
};

// DELETE - Remover contato
const removeContact = async (contactId) => {
  const contacts = await getContacts();
  const filtered = contacts.filter(c => c.id !== contactId);
  await SecureStore.setItemAsync('contacts', JSON.stringify(filtered));
};
```

### 3. **Sistema de Emergência**

#### Fluxo de Ativação
```
Usuário pressiona SOS
        ↓
Confirma a ação
        ↓
Solicita permissão GPS
        ↓
Obtém localização atual
        ↓
Busca contatos salvos
        ↓
Monta mensagem de socorro
        ↓
Envia SMS para todos os contatos
        ↓
Confirma envio para usuário
```

#### Implementação do GPS
```javascript
const getCurrentLocation = async () => {
  // Solicita permissão
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;
  
  // Obtém coordenadas
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
    timeout: 10000
  });
  
  return {
    lat: location.coords.latitude,
    lng: location.coords.longitude,
    when: new Date().toISOString()
  };
};
```

#### Envio de SMS
```javascript
const sendEmergencySMS = async (contacts, location) => {
  const phones = contacts.map(c => c.phone);
  
  let message = '🚨 EMERGÊNCIA - Estou precisando de ajuda AGORA!';
  
  if (location) {
    const mapsUrl = `https://maps.google.com/?q=${location.lat},${location.lng}`;
    message += `\n\n📍 Estou aqui: ${mapsUrl}`;
    message += `\n⏰ ${new Date().toLocaleString('pt-BR')}`;
  }
  
  await SMS.sendSMSAsync(phones, message);
};
```

---

## 🔄 Fluxo de Desenvolvimento

### Fase 1: Planejamento e Setup
1. **Análise de Requisitos**
   - Identificação das necessidades do usuário
   - Definição de funcionalidades essenciais
   - Priorização por importância e complexidade

2. **Setup do Ambiente**
   ```bash
   npx create-expo-app guardian-app
   cd guardian-app
   npx expo install expo-location expo-sms expo-secure-store
   ```

3. **Estruturação do Projeto**
   - Criação da arquitetura de pastas
   - Definição de padrões de código
   - Setup de dependências

### Fase 2: Desenvolvimento do MVP
1. **Interface Básica**
   - Tela de login simples
   - Tela principal com botão SOS
   - Navegação entre telas

2. **Funcionalidades Core**
   - Sistema de autenticação
   - Gerenciamento de contatos
   - Ativação de emergência

3. **Integração com APIs Nativas**
   - GPS para localização
   - SMS para comunicação
   - Armazenamento seguro

### Fase 3: Refinamento e Testes
1. **Tratamento de Erros**
   - Validações de entrada
   - Fallbacks para falhas de API
   - Mensagens de erro amigáveis

2. **Otimização de Performance**
   - Lazy loading de componentes
   - Otimização de re-renders
   - Cache de dados frequentes

3. **Testes em Dispositivos Reais**
   - Teste de funcionalidades
   - Validação de UX
   - Correção de bugs

---

## 🚨 Problemas Encontrados e Soluções

### 1. **Incompatibilidade de Versões**
**Problema:** Versões do Expo e React Native incompatíveis
```
Error: Project incompatible with this version of ExpoGo
```

**Solução:** Criação de projeto novo com versões compatíveis
```bash
npx create-expo-app guardian-app --template blank
```

### 2. **Dependências Corrompidas**
**Problema:** node_modules corrompido causando erros de módulo
```
Error: Cannot find module 'nice-try/src/index.js'
```

**Solução:** Limpeza e reinstalação
```bash
rm -rf node_modules
npm install
```

### 3. **Erros de Navegação**
**Problema:** React Navigation causando tela vermelha de erro

**Solução:** Simplificação para navegação por estado
```javascript
// Ao invés de React Navigation
const [currentScreen, setCurrentScreen] = useState('home');

// Renderização condicional
if (currentScreen === 'contacts') return <ContactsScreen />;
return <HomeScreen />;
```

### 4. **Permissões de API**
**Problema:** APIs nativas requerem permissões específicas

**Solução:** Solicitação adequada de permissões
```javascript
const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== 'granted') {
  Alert.alert('Erro', 'Permissão de localização necessária');
  return;
}
```

---

## 🔐 Segurança e Privacidade

### Armazenamento Seguro
```javascript
// Dados criptografados localmente
await SecureStore.setItemAsync('contacts', JSON.stringify(contacts));
```

**Características:**
- Criptografia AES-256
- Chaves protegidas pelo sistema
- Dados não acessíveis por outros apps

### Princípios de Privacidade
1. **Minimização de Dados**: Coleta apenas dados essenciais
2. **Armazenamento Local**: Dados não saem do dispositivo
3. **Transparência**: Usuário sabe exatamente o que acontece
4. **Controle**: Usuário pode deletar dados a qualquer momento

### Considerações de Segurança
- PIN deve ser configurável pelo usuário
- Implementar timeout de sessão
- Adicionar opção de limpeza remota
- Considerar modo invisível/disfarce

---

## 🚀 Como Expandir o App

### Funcionalidades Prioritárias

#### 1. **Gravação de Áudio**
```javascript
import { Audio } from 'expo-av';

const startRecording = async () => {
  const { status } = await Audio.requestPermissionsAsync();
  if (status === 'granted') {
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    await recording.startAsync();
  }
};
```

#### 2. **Mapa de Locais Seguros**
```javascript
import MapView, { Marker } from 'react-native-maps';

const SafePlacesMap = () => (
  <MapView style={styles.map}>
    <Marker coordinate={{latitude: -23.5505, longitude: -46.6333}} 
            title="Delegacia da Mulher" />
  </MapView>
);
```

#### 3. **Chat Seguro**
```javascript
// Implementação com WebSocket ou Firebase
const sendMessage = async (message) => {
  await firebase.firestore()
    .collection('chats')
    .add({
      message: encrypt(message),
      timestamp: new Date(),
      userId: getCurrentUserId()
    });
};
```

#### 4. **Backup em Nuvem**
```javascript
// Sincronização criptografada
const backupData = async () => {
  const data = await SecureStore.getItemAsync('userData');
  const encrypted = encrypt(data, userKey);
  await uploadToCloud(encrypted);
};
```

### Melhorias Técnicas

#### 1. **Arquitetura Mais Robusta**
```javascript
// Context API para estado global
const AppContext = createContext();

// Redux para estado complexo
const store = createStore(rootReducer);

// Custom Hooks para lógica reutilizável
const useEmergency = () => {
  const [isActive, setIsActive] = useState(false);
  // lógica de emergência
  return { isActive, activate, deactivate };
};
```

#### 2. **Testes Automatizados**
```javascript
// Jest + React Native Testing Library
import { render, fireEvent } from '@testing-library/react-native';

test('should activate emergency when SOS button is pressed', () => {
  const { getByText } = render(<App />);
  const sosButton = getByText('SOS');
  fireEvent.press(sosButton);
  expect(mockEmergencyService.activate).toHaveBeenCalled();
});
```

#### 3. **CI/CD Pipeline**
```yaml
# GitHub Actions
name: Build and Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Build app
        run: expo build:android
```

---

## 📊 Métricas e Analytics

### KPIs Importantes
- **Tempo de ativação**: Tempo entre toque no SOS e envio do SMS
- **Taxa de sucesso**: Percentual de emergências ativadas com sucesso
- **Uso por funcionalidade**: Quais recursos são mais utilizados
- **Retenção de usuários**: Frequência de uso do app

### Implementação de Analytics
```javascript
// Expo Analytics ou Firebase Analytics
import * as Analytics from 'expo-firebase-analytics';

const trackEmergencyActivation = () => {
  Analytics.logEvent('emergency_activated', {
    timestamp: new Date().toISOString(),
    location_available: !!currentLocation,
    contacts_count: contacts.length
  });
};
```

---

## 🎨 Design e UX

### Princípios de Design
1. **Simplicidade**: Interface limpa e intuitiva
2. **Acessibilidade**: Funciona para diferentes idades e habilidades
3. **Discrição**: Não chama atenção indevida
4. **Urgência**: Elementos críticos bem destacados

### Paleta de Cores
```javascript
const colors = {
  primary: '#2d3436',      // Cinza escuro - seriedade
  secondary: '#00b894',    // Verde - segurança
  danger: '#d63031',       // Vermelho - emergência
  warning: '#f39c12',      // Laranja - atenção
  background: '#f8f9fa',   // Cinza claro - suavidade
  text: '#2d3436'          // Cinza escuro - legibilidade
};
```

### Componentes Reutilizáveis
```javascript
const Button = ({ title, onPress, variant = 'primary' }) => (
  <TouchableOpacity 
    style={[styles.button, styles[variant]]} 
    onPress={onPress}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);
```

---

## 📱 Deploy e Distribuição

### Build para Produção
```bash
# Android
expo build:android

# iOS
expo build:ios

# Web
expo build:web
```

### Publicação nas Lojas
```javascript
// app.json - Configurações de publicação
{
  "expo": {
    "name": "Safe Guardian",
    "slug": "safe-guardian",
    "version": "1.0.0",
    "privacy": "unlisted",
    "platforms": ["ios", "android"],
    "android": {
      "package": "com.safeguardian.app",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "SEND_SMS",
        "USE_FINGERPRINT"
      ]
    },
    "ios": {
      "bundleIdentifier": "com.safeguardian.app"
    }
  }
}
```

---

## 🤝 Considerações Éticas e Legais

### Compliance LGPD
- Consentimento explícito para coleta de dados
- Direito ao esquecimento (deletar dados)
- Transparência sobre uso dos dados
- Segurança no armazenamento

### Responsabilidade Social
- Parcerias com ONGs especializadas
- Treinamento para voluntários
- Protocolo de atendimento padronizado
- Suporte psicológico integrado

### Aspectos Legais
- Validade legal das evidências coletadas
- Protocolo para situações de risco iminente
- Integração com autoridades competentes
- Proteção de dados sensíveis

---

## 📚 Recursos Adicionais

### Documentação Técnica
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)

### Comunidade e Suporte
- [Expo Discord](https://discord.gg/expo)
- [React Native Community](https://github.com/react-native-community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

### Ferramentas Úteis
- [Expo Snack](https://snack.expo.dev/) - Playground online
- [Flipper](https://fbflipper.com/) - Debugging
- [Reactotron](https://github.com/infinitered/reactotron) - Monitoring

---

## 🎯 Conclusão

O Safe Guardian representa uma solução tecnológica importante para um problema social crítico. A implementação atual fornece uma base sólida com funcionalidades essenciais de emergência, enquanto a arquitetura permite expansão futura com recursos mais avançados.

### Próximos Passos
1. **Testes com usuários reais** para validar UX
2. **Implementação de funcionalidades avançadas** (áudio, chat, mapa)
3. **Parcerias estratégicas** com organizações especializadas
4. **Certificações de segurança** e compliance
5. **Lançamento gradual** com acompanhamento de métricas

### Impacto Esperado
- Redução do tempo de resposta em emergências
- Maior sensação de segurança para usuárias
- Facilitação do acesso a redes de apoio
- Contribuição para quebra do ciclo de violência

---

*Documentação criada em: ${new Date().toLocaleDateString('pt-BR')}*
*Versão do App: 1.0.0*
*Autor: Assistente de IA Amazon Q*
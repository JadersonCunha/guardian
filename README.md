# Female Guardian

Um aplicativo móvel discreto e seguro desenvolvido para auxiliar mulheres em situações de violência doméstica, oferecendo recursos de emergência, documentação e rede de apoio.

## Sobre o Projeto

O Female Guardian nasceu da necessidade de criar uma ferramenta tecnológica que pudesse oferecer suporte imediato e discreto para mulheres em situações de vulnerabilidade. O aplicativo foi pensado para ser intuitivo, rápido e, principalmente, seguro.

### Objetivo Principal

Fornecer um meio rápido e seguro para que mulheres em situação de risco possam solicitar ajuda, documentar evidências e acessar informações sobre seus direitos, tudo de forma discreta e protegida.

## Funcionalidades

### Versão Atual (MVP)

- **Sistema de Autenticação Segura**: Acesso protegido por PIN com suporte futuro para biometria
- **Botão de Emergência SOS**: Ativação rápida que envia localização GPS e mensagens automáticas
- **Gerenciamento de Contatos**: Cadastro e organização de contatos de confiança
- **Localização GPS**: Compartilhamento automático da localização em situações de emergência
- **Envio de Mensagens**: Notificação automática dos contatos via WhatsApp
- **Chat com IA**: Assistente virtual para informações sobre direitos da mulher
- **Captura de Evidências**: Câmera integrada para fotos, vídeos e gravações de áudio
- **Locais Seguros**: Mapa com locais seguros próximos baseado na localização atual

### Próximas Funcionalidades

- Modo invisível/disfarce para maior discrição
- Backup seguro em nuvem criptografada
- Integração com serviços oficiais de apoio
- Recursos educativos personalizados
- Detecção automática de situações de risco

## Tecnologias Utilizadas

### Framework e Linguagens
- **React Native** com Expo SDK 54.0
- **JavaScript** para lógica de negócio
- **Node.js** como runtime

### Bibliotecas Principais
- **Expo Location** - Geolocalização e GPS
- **Expo SecureStore** - Armazenamento criptografado
- **Expo SMS** - Envio de mensagens
- **Expo Camera** - Captura de mídia
- **Expo Contacts** - Acesso aos contatos do dispositivo
- **React Navigation** - Navegação entre telas

### APIs Externas
- **Google Gemini AI** - Chat inteligente sobre direitos da mulher
- **WhatsApp Business API** - Envio de mensagens de emergência

## Como Executar o Projeto

### Pré-requisitos

```bash
Node.js (versão 16 ou superior)
npm ou yarn
Expo CLI
```

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/female-guardian.git
cd female-guardian
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npx expo start
```

### Testando no Dispositivo

1. Instale o aplicativo **Expo Go** no seu smartphone
2. Escaneie o QR code gerado no terminal
3. O aplicativo será carregado automaticamente no seu dispositivo

## Estrutura do Projeto

```
safe-guardian/
├── App.js                    # Componente principal e navegação
├── package.json              # Dependências e configurações
├── app.json                  # Configurações do Expo
├── assets/                   # Recursos visuais
│   ├── icon.png
│   ├── splash.png
│   └── favicon.png
└── src/                      # Código fonte
    ├── screens/              # Telas do aplicativo
    │   ├── RegisterScreen.js
    │   ├── ContactsScreen.js
    │   ├── CameraScreen.js
    │   ├── SafePlacesScreen.js
    │   ├── RightsScreen.js
    │   └── ForgotPasswordScreen.js
    └── services/             # Lógica de negócio
        ├── AuthService.js
        ├── ContactService.js
        └── EmergencyService.js
```

## Segurança e Privacidade

### Medidas de Proteção Implementadas

- **Armazenamento Criptografado**: Todos os dados sensíveis são armazenados usando Expo SecureStore
- **Dados Locais**: Informações pessoais ficam apenas no dispositivo do usuário
- **Sem Rastreamento**: O aplicativo não coleta dados de uso ou comportamento
- **Acesso Protegido**: Sistema de autenticação obrigatório para acesso
- **Privacidade por Design**: Desenvolvido pensando na proteção máxima da usuária

### Conformidade Legal

- Compliance com a Lei Geral de Proteção de Dados (LGPD)
- Evidências capturadas podem ter validade legal
- Protocolo de atendimento seguindo diretrizes oficiais

## Como Usar

### Primeiro Acesso

1. Abra o aplicativo e crie sua conta
2. Configure um PIN de segurança forte
3. Adicione contatos de emergência confiáveis
4. Permita acesso à localização quando solicitado
5. Teste o botão de emergência em ambiente seguro

### Em Situação de Emergência

1. Abra o aplicativo rapidamente
2. Pressione o botão SOS vermelho
3. Confirme a ativação quando solicitado
4. Sua localização será enviada automaticamente
5. Contatos receberão mensagem via WhatsApp

## Contatos de Emergência Oficiais

- **Polícia Militar**: 190
- **Central de Atendimento à Mulher**: 180
- **SAMU**: 192
- **Bombeiros**: 193
- **Disque Direitos Humanos**: 100

## Contribuindo

Este é um projeto de código aberto desenvolvido com o objetivo de ajudar mulheres em situação de vulnerabilidade. Contribuições são bem-vindas e podem salvar vidas.

### Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Áreas que Precisam de Ajuda

- Tradução para outros idiomas
- Testes em diferentes dispositivos
- Melhorias na interface do usuário
- Integração com mais serviços de apoio
- Documentação e tutoriais

## Parcerias e Apoio

O projeto busca parcerias com:

- Casa da Mulher Brasileira
- Instituto Maria da Penha
- Delegacias Especializadas no Atendimento à Mulher
- ONGs locais de apoio à mulher
- Universidades e centros de pesquisa



## Aviso Importante

Este aplicativo é uma ferramenta de auxílio e não substitui o atendimento profissional especializado. Em situações de emergência real, sempre procure ajuda das autoridades competentes através dos canais oficiais.

O Female Guardian foi desenvolvido com muito cuidado e responsabilidade, pensando na segurança e privacidade das usuárias. Cada linha de código foi escrita com o objetivo de poder fazer a diferença na vida de alguém.

## Contato

Para dúvidas, sugestões ou parcerias, entre em contato através dos canais oficiais do projeto.

---

**Desenvolvido com dedicação para fazer a diferença na vida das mulheres brasileiras.**

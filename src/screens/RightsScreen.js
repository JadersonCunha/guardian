import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';

export default function RightsScreen({ navigation }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: '👋 Olá! Sou o assistente "Direitos da Mulher - Guardian". Posso te ajudar com informações sobre seus direitos legais. O que você gostaria de saber?'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendQuestion = async () => {
    if (!question.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: question
    };
    
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    try {
      const response = await callGeminiAgent(question);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      Alert.alert('Erro', 'Não consegui conectar com o assistente. Tente novamente.');
      console.error('Erro na API:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const callGeminiAgent = async (userQuestion) => {
    const API_KEY = 'AIzaSyDUOSigYrBmuizRoWgPO5yh0kXbXO6Jhy0';
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
    
    const requestBody = {
      contents: [{
        parts: [{
          text: `Você é o assistente "Direitos da Mulher - Guardian", especializado em direitos das mulheres no Brasil. Responda de forma clara, objetiva e acolhedora sobre direitos legais, violência doméstica, Lei Maria da Penha, medidas protetivas e recursos de apoio. Pergunta: ${userQuestion}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    const response = await fetch(`${endpoint}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  };

  const quickQuestions = [
    "O que é a Lei Maria da Penha?",
    "Como solicitar medida protetiva?",
    "Quais são meus direitos em caso de violência?",
    "Como fazer um boletim de ocorrência?",
    "Onde buscar ajuda jurídica gratuita?"
  ];

  const askQuickQuestion = (quickQ) => {
    setQuestion(quickQ);
  };

  const renderMessage = (message) => (
    <View key={message.id} style={[
      styles.messageContainer,
      message.type === 'user' ? styles.userMessage : styles.botMessage
    ]}>
      <Text style={[
        styles.messageText,
        message.type === 'user' ? styles.userText : styles.botText
      ]}>
        {message.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🤖 Meus Direitos</Text>
      </View>

      <ScrollView 
        style={styles.chatContainer}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map(renderMessage)}
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>🤖 Pensando...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.quickQuestionsContainer}>
        <Text style={styles.quickTitle}>Perguntas Rápidas:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickQuestions.map((q, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.quickBtn}
              onPress={() => askQuickQuestion(q)}
            >
              <Text style={styles.quickBtnText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Digite sua pergunta sobre direitos..."
          value={question}
          onChangeText={setQuestion}
          multiline
          returnKeyType="send"
          onSubmitEditing={sendQuestion}
        />
        <TouchableOpacity 
          style={styles.sendBtn}
          onPress={sendQuestion}
          disabled={isLoading || !question.trim()}
        >
          <Text style={styles.sendBtnText}>📤</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'white',
    elevation: 2,
  },
  backBtn: {
    fontSize: 16,
    color: '#0984e3',
    marginRight: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  chatContainer: {
    flex: 1,
    padding: 15,
  },
  messageContainer: {
    marginBottom: 15,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0984e3',
    borderRadius: 15,
    padding: 12,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 12,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: 'white',
  },
  botText: {
    color: '#2d3436',
  },
  loadingContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 12,
    elevation: 1,
  },
  loadingText: {
    color: '#636e72',
    fontStyle: 'italic',
  },
  quickQuestionsContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#636e72',
    marginBottom: 10,
  },
  quickBtn: {
    backgroundColor: '#74b9ff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  quickBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendBtn: {
    backgroundColor: '#00b894',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: {
    fontSize: 18,
  },
});
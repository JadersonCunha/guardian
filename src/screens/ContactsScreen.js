import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput, Switch, Image, KeyboardAvoidingView, Platform } from 'react-native';
import * as Contacts from 'expo-contacts';
import ContactService from '../services/ContactService';

export default function ContactsScreen({ navigation }) {
  const [myContacts, setMyContacts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [phoneContacts, setPhoneContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [shouldReceiveIntruderAlert, setShouldReceiveIntruderAlert] = useState(true);

  useEffect(() => {
    loadMyContacts();
    loadPhoneContacts();
  }, []);

  useEffect(() => {
    if (searchText.length > 0) {
      const filtered = phoneContacts.filter(contact => {
        const searchLower = searchText.toLowerCase();
        const nameLower = contact.name.toLowerCase();
        return nameLower.includes(searchLower) || nameLower.startsWith(searchLower);
      });
      setFilteredContacts(filtered.slice(0, 8));
    } else {
      setFilteredContacts([]);
    }
  }, [searchText, phoneContacts]);

  const loadMyContacts = async () => {
    const saved = await ContactService.getEmergencyContacts();
    setMyContacts(saved);
  };

  const loadPhoneContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.FirstName, Contacts.Fields.LastName],
        sort: Contacts.SortTypes.FirstName,
      });
      
      const contacts = data
        .filter(contact => {
          const hasName = contact.name || contact.firstName || contact.lastName;
          const hasPhone = contact.phoneNumbers?.length > 0;
          return hasName && hasPhone;
        })
        .map(contact => {
          const displayName = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
          const cleanPhone = contact.phoneNumbers[0].number.replace(/[^0-9+]/g, '');
          return {
            name: displayName,
            phone: cleanPhone
          };
        })
        .filter(contact => contact.name.length > 0);
      
      setPhoneContacts(contacts);
      console.log(`Carregados ${contacts.length} contatos`);
    }
  };

  const addContactFromPhone = async (contact) => {
    await ContactService.addEmergencyContact(contact, shouldReceiveIntruderAlert);
    setSearchText('');
    setIsAdding(false);
    loadMyContacts();
    Alert.alert('✅ Sucesso!', `${contact.name} foi adicionado aos seus contatos de emergência!`);
  };

  const addDefaultContact = async () => {
    const contacts = await ContactService.getEmergencyContacts();
    const hasDefault = contacts.some(c => c.phone === '51985330121'); 
    
    if (!hasDefault) { // O contato padrão deve receber alertas por padrão
      await ContactService.addEmergencyContact({
        name: 'Contato de Emergência',
        phone: '51985330121'
      });
      loadMyContacts();
      Alert.alert('✅ Pronto!', 'Contato de emergência adicionado!');
    }
  };

  const deleteContact = async (contactId) => {
    Alert.alert(
      'Remover?',
      'Tem certeza? Esse contato não vai mais receber seus alertas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim, remover', style: 'destructive', onPress: async () => {
          await ContactService.removeEmergencyContact(contactId);
          loadMyContacts();
        }}
      ]
    );
  };

  const renderContactItem = ({ item }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactDetails}>
        <Text style={styles.personName}>{item.name}</Text>
        <Text style={styles.personPhone}>{item.phone}</Text>
      </View>
      {item.receiveIntruderAlert && (
        <View style={styles.intruderAlertIndicator}>
          <Text style={styles.intruderAlertText}>🚨</Text>
        </View>
      )}
      <TouchableOpacity 
        style={styles.deleteBtn}
        onPress={() => deleteContact(item.id)}
      >
        <Text style={styles.deleteIcon}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <Image source={require('../../assets/logo.png')} style={styles.headerLogo} />
        <Text style={styles.title}>Meus Contatos</Text>
      </View>
      
      {myContacts.length === 0 && (
        <Text style={styles.emptyText}>Nenhum contato de emergência ainda</Text>
      )}

      <FlatList
        data={myContacts}
        renderItem={renderContactItem}
        keyExtractor={item => item.id}
        style={styles.contactsList}
      />

      <View style={styles.bottomContainer}>
        {isAdding ? (
          <View style={styles.addForm}>
            <TextInput
              style={styles.searchInput}
              placeholder="Digite o nome do contato..."
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
            
            {filteredContacts.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {filteredContacts.map((contact, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => addContactFromPhone(contact)}
                  >
                    <Text style={styles.suggestionName}>{contact.name}</Text>
                    <Text style={styles.suggestionPhone}>{contact.phone}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.switchOuterContainer}>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Receber Alerta de Intruso?</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#00b894" }}
                  thumbColor={shouldReceiveIntruderAlert ? "#f4f3f4" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={setShouldReceiveIntruderAlert}
                  value={shouldReceiveIntruderAlert}
                />
              </View>
            </View>
            
            <View style={styles.formBtns}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => {
                  setIsAdding(false);
                  setSearchText('');
                }}
              >
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.addContactBtn}
              onPress={() => setIsAdding(true)}
            >
              <Text style={styles.addBtnText}>+ Buscar nos Meus Contatos</Text>
            </TouchableOpacity>
            
            {myContacts.length === 0 && (
              <TouchableOpacity 
                style={styles.defaultBtn}
                onPress={addDefaultContact}
              >
                <Text style={styles.addBtnText}>+ Contato de Suporte</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    fontSize: 16,
    color: '#0984e3',
    marginRight: 20,
  },
  headerLogo: {
    width: 24,
    height: 24,
    marginRight: 10,
    borderRadius: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2d3436',
  },
  emptyText: {
    textAlign: 'center',
    color: '#636e72',
    fontSize: 16,
    marginVertical: 30,
    fontStyle: 'italic',
  },
  contactsList: {
    flex: 1,
  },
  contactCard: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
  },
  contactDetails: {
    flex: 1,
  },
  personName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 4,
  },
  personPhone: {
    fontSize: 15,
    color: '#636e72',
  },
  deleteBtn: {
    backgroundColor: '#e17055',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  intruderAlertIndicator: {
    backgroundColor: '#ffeaa7', // Um amarelo claro para destacar
    borderRadius: 5, 
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 10,
  },
  intruderAlertText: {
    fontSize: 14,
  },
  addContactBtn: {
    backgroundColor: '#00b894',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  addBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomContainer: {
    marginTop: 'auto',
  },
  buttonsContainer: {
    gap: 10,
  },
  defaultBtn: {
    backgroundColor: '#6c5ce7',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  switchOuterContainer: {
    backgroundColor: '#f1f2f6',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addForm: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 12,
    elevation: 6,
    marginTop: 10,
  },
  searchInput: {
    borderWidth: 1.5,
    borderColor: '#00b894',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2d3436',
    fontWeight: '500',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  suggestionPhone: {
    fontSize: 14,
    color: '#636e72',
    marginTop: 2,
  },
  formBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelBtn: {
    backgroundColor: '#74b9ff',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#00b894',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
});
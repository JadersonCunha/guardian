import * as SecureStore from 'expo-secure-store';

class ContactService {
  static STORAGE_KEY = 'emergency_contacts';

  static async getEmergencyContacts() {
    try {
      const savedData = await SecureStore.getItemAsync(this.STORAGE_KEY);
      const contacts = savedData ? JSON.parse(savedData) : [];
      console.log(`📞 ${contacts.length} contatos carregados`);
      return contacts;
    } catch (err) {
      console.error('Erro ao carregar contatos:', err);
      return [];
    }
  }

  static async addEmergencyContact(newPerson, receiveIntruderAlert = true) { // Adicionado receiveIntruderAlert com valor padrão
    try {
      const currentContacts = await this.getEmergencyContacts();
      
      const contactToAdd = {
        id: `contact_${Date.now()}`,
        name: newPerson.name.trim(),
        phone: newPerson.phone.trim(),
        addedAt: new Date().toISOString(),
        receiveIntruderAlert: receiveIntruderAlert, // Armazena a preferência
      };
      
      currentContacts.push(contactToAdd);
      await SecureStore.setItemAsync(this.STORAGE_KEY, JSON.stringify(currentContacts));
      
      console.log('✅ Contato salvo:', contactToAdd.name);
      return contactToAdd;
    } catch (err) {
      console.error('Erro ao salvar contato:', err);
      throw err;
    }
  }

  static async removeEmergencyContact(contactId) {
    try {
      const allContacts = await this.getEmergencyContacts();
      const remainingContacts = allContacts.filter(c => c.id !== contactId);
      
      await SecureStore.setItemAsync(this.STORAGE_KEY, JSON.stringify(remainingContacts));
      console.log('🗑️ Contato removido:', contactId);
    } catch (err) {
      console.error('Erro ao deletar contato:', err);
      throw err;
    }
  }
}

export default ContactService;
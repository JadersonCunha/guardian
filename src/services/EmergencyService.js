import * as Location from 'expo-location';
import { Platform, Linking, Alert } from 'react-native';
import ContactService from './ContactService';

class EmergencyService {
  static async activateEmergency() {
    console.log('🚨 ATIVANDO EMERGÊNCIA!');
    
    try {
      const userLocation = await this.getCurrentLocation();
      
      const emergencyContacts = await ContactService.getEmergencyContacts();
      
      if (emergencyContacts.length === 0) {
        console.log('⚠️ Nenhum contato cadastrado ainda');
        return { success: false, message: 'Adicione contatos de emergência primeiro!' };
      }
      
      await this.sendEmergencyWhatsApp(emergencyContacts, userLocation);
      
      console.log('✅ Emergência ativada! Mensagens enviadas.');
      return { success: true, message: `WhatsApp aberto para ${emergencyContacts.length} contato(s)` };
    } catch (err) {
      console.error('💥 Erro na emergência:', err);
      return { success: false, message: 'Erro ao ativar emergência' };
    }
  }

  static async getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('❌ Permissão de localização negada');
        return null;
      }

      console.log('📍 Buscando localização...');
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });

      const coords = {
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        when: new Date().toISOString(),
      };
      
      console.log('📍 Localização obtida:', coords.lat, coords.lng);
      return coords;
    } catch (err) {
      console.error('Erro no GPS:', err);
      return null;
    }
  }

  static async sendEmergencyWhatsApp(contacts, userLoc) {
    try {
      let sosMessage = '🚨 EMERGÊNCIA - Estou precisando de ajuda AGORA!';
      
      if (userLoc) {
        const googleMaps = `https://maps.google.com/?q=${userLoc.lat},${userLoc.lng}`;
        sosMessage += `\n\n📍 Estou aqui: ${googleMaps}`;
        sosMessage += `\n⏰ Enviado em: ${new Date().toLocaleString('pt-BR')}`;
        sosMessage += `\n\n⚠️ Esta é uma mensagem automática do app Guardian`;
      } else {
        sosMessage += '\n\n⚠️ Não consegui pegar minha localização, mas preciso de ajuda!';
      }

      for (const contact of contacts) {
        await this.openWhatsApp(contact.phone, sosMessage);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log(`💚 WhatsApp aberto para ${contacts.length} contatos`);
    } catch (err) {
      console.error('Falha no envio via WhatsApp:', err);
    }
  }

  static async openWhatsApp(phoneNumber, message) {
    try {
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      
      const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      
      const encodedMessage = encodeURIComponent(message);
      
      const whatsappUrl = `whatsapp://send?phone=${fullPhone}&text=${encodedMessage}`;
      
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        console.log(`💚 WhatsApp aberto para: ${phoneNumber}`);
      } else {
        const webUrl = `https://wa.me/${fullPhone}?text=${encodedMessage}`;
        await Linking.openURL(webUrl);
        console.log(`🌐 WhatsApp Web aberto para: ${phoneNumber}`);
      }
    } catch (err) {
      console.error('Erro ao abrir WhatsApp:', err);
    }
  }

  /**
   * Sends an intruder alert message to emergency contacts who are configured to receive it.
   * @returns {Promise<{success: boolean, message: string}>}
   */
  static async sendIntruderAlertToSelectedContacts() {
    console.log('🚨 ENVIANDO ALERTA DE INTRUSO PARA CONTATOS SELECIONADOS!');

    try {
      // 1. Get emergency contacts
      const emergencyContacts = await ContactService.getEmergencyContacts();
      const contactsForIntruderAlert = emergencyContacts.filter(contact => contact.receiveIntruderAlert);

      if (contactsForIntruderAlert.length === 0) {
        Alert.alert('⚠️ Atenção', 'Nenhum contato de emergência habilitado para receber alertas de intruso.');
        return { success: false, message: 'Nenhum contato habilitado para alerta de intruso.' };
      }

      // 2. Construct message
      const intruderMessage = '🚨 ALERTA DE INTRUSO! Alguém tentou acessar o app e errou o PIN múltiplas vezes. Fique atento(a)!';

      // 3. Send message to selected contacts via WhatsApp
      for (const contact of contactsForIntruderAlert) {
        await this.openWhatsApp(contact.phone, intruderMessage);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay to avoid WhatsApp API issues
      }

      Alert.alert('✅ Alerta enviado!', `O alerta de intruso foi enviado para ${contactsForIntruderAlert.length} contato(s) de emergência.`);
      console.log('✅ Alerta de intruso enviado.');
      return { success: true, message: 'Alerta de intruso enviado.' };
    } catch (err) {
      console.error('💥 Erro ao capturar e enviar foto do intruso:', err);
      Alert.alert('Erro', 'Não foi possível capturar ou enviar a foto do intruso.');
      return { success: false, message: 'Erro ao capturar e enviar foto do intruso.' };
    }
  }
}

export default EmergencyService;
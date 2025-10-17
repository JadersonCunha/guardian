import * as Location from 'expo-location';
import { Platform, Linking } from 'react-native';
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
}

export default EmergencyService;
import * as SecureStore from 'expo-secure-store';

class AuthService {
  static USER_KEY = 'user_data';
  static PIN_KEY = 'user_pin';

  // Verifica se usuário já existe
  static async userExists() {
    try {
      const userData = await SecureStore.getItemAsync(this.USER_KEY);
      return userData !== null;
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      return false;
    }
  }

  // Cadastra novo usuário
  static async registerUser(userData) {
    try {
      const user = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        pin: userData.pin,
        createdAt: new Date().toISOString(),
      };

      await SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(user));
      await SecureStore.setItemAsync(this.PIN_KEY, userData.pin);
      
      console.log('✅ Usuário cadastrado com sucesso');
      return { success: true };
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      return { success: false, error: 'Erro ao salvar dados' };
    }
  }

  // Autentica usuário
  static async authenticateUser(pin) {
    try {
      const savedPin = await SecureStore.getItemAsync(this.PIN_KEY);
      return savedPin === pin;
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return false;
    }
  }

  // Pega dados do usuário
  static async getUserData() {
    try {
      const userData = await SecureStore.getItemAsync(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      return null;
    }
  }

  // Atualiza PIN
  static async updatePin(newPin) {
    try {
      const userData = await this.getUserData();
      if (userData) {
        userData.pin = newPin;
        await SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(userData));
        await SecureStore.setItemAsync(this.PIN_KEY, newPin);
        return { success: true };
      }
      return { success: false, error: 'Usuário não encontrado' };
    } catch (error) {
      console.error('Erro ao atualizar PIN:', error);
      return { success: false, error: 'Erro ao atualizar PIN' };
    }
  }

  // Limpa todos os dados (reset do app)
  static async clearAllData() {
    try {
      await SecureStore.deleteItemAsync(this.USER_KEY);
      await SecureStore.deleteItemAsync(this.PIN_KEY);
      await SecureStore.deleteItemAsync('contacts'); // Remove contatos também
      console.log('✅ Todos os dados foram removidos');
      return { success: true };
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      return { success: false, error: 'Erro ao limpar dados' };
    }
  }
}

export default AuthService;
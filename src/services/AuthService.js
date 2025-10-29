import * as SecureStore from 'expo-secure-store';

class AuthService {
  // ... (código existente)
  static USER_KEY = 'guardian_user_data'; 
  static PIN_KEY = 'guardian_user_pin';
  static FAILED_ATTEMPTS_KEY = 'guardian_failed_login_attempts';
  static LAST_FAILED_ATTEMPT_TIME_KEY = 'guardian_last_failed_attempt_time';
  static MAX_FAILED_ATTEMPTS = 2;
  
  static async userExists() {
    try {
      const userData = await SecureStore.getItemAsync(this.USER_KEY);
      return userData !== null;
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      return false;
    }
  }

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

  /**
   * Autentica o usuário e rastreia tentativas falhas. 
   * @returns {Promise<{success: boolean, intruderDetected?: boolean, message: string}>}
   */
  static async authenticateUser(pin) {
    try {
      const savedPin = await SecureStore.getItemAsync(this.PIN_KEY);
      if (savedPin === pin) {
        await this.resetFailedAttempts();
        return { success: true, message: 'Login bem-sucedido!' };
      } else {
        const attempts = await this.recordFailedAttempt();
        if (attempts >= this.MAX_FAILED_ATTEMPTS) {
          return { success: false, intruderDetected: true, message: 'PIN incorreto. Alerta de segurança ativado.' };
        }
        return { success: false, message: `PIN incorreto. Tentativa ${attempts} de ${this.MAX_FAILED_ATTEMPTS}.` }; 
      }
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return { success: false, message: 'Erro durante a autenticação.' };
    }
  }

  static async getFailedAttempts() {
    const attempts = await SecureStore.getItemAsync(this.FAILED_ATTEMPTS_KEY);
    const lastAttemptTime = await SecureStore.getItemAsync(this.LAST_FAILED_ATTEMPT_TIME_KEY);

    // Reseta as tentativas se passaram mais de 5 minutos
    const FIVE_MINUTES = 5 * 60 * 1000;
    if (lastAttemptTime && (Date.now() - parseInt(lastAttemptTime, 10)) > FIVE_MINUTES) {
      await this.resetFailedAttempts();
      return 0;
    }
    return attempts ? parseInt(attempts, 10) : 0;
  }

  static async recordFailedAttempt() {
    let attempts = await this.getFailedAttempts();
    attempts++;
    await SecureStore.setItemAsync(this.FAILED_ATTEMPTS_KEY, attempts.toString());
    await SecureStore.setItemAsync(this.LAST_FAILED_ATTEMPT_TIME_KEY, Date.now().toString());
    return attempts;
  }

  static async resetFailedAttempts() {
    await SecureStore.deleteItemAsync(this.FAILED_ATTEMPTS_KEY);
    await SecureStore.deleteItemAsync(this.LAST_FAILED_ATTEMPT_TIME_KEY);
  }

  static async getUserData() {
    try {
      const userData = await SecureStore.getItemAsync(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      return null;
    }
  }

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

  static async clearAllData() {
    try {
      await SecureStore.deleteItemAsync(this.USER_KEY);
      await SecureStore.deleteItemAsync(this.PIN_KEY);
      await this.resetFailedAttempts();
      console.log('✅ Todos os dados foram removidos');
      return { success: true };
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      return { success: false, error: 'Erro ao limpar dados' };
    }
  }
}

export default AuthService;
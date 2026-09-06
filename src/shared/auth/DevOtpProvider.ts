import 'server-only';
import { IOtpProvider } from './interfaces';

export class DevOtpProvider implements IOtpProvider {
  async sendOtp(phoneNumber: string, code: string): Promise<void> {
    // In a real provider, this would call Twilio/Meta API.
    // Here we just log to the console to bypass network limits during local development.
    console.log('=========================================');
    console.log('📱 DEV OTP DELIVERY (Network Bypassed)');
    console.log(`To: ${phoneNumber}`);
    console.log(`Code: ${code}`);
    console.log('=========================================');
    
    // Simulate slight network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}

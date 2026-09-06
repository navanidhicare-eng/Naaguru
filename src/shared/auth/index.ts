import { DevOtpProvider } from './DevOtpProvider';
import { TokenService } from './TokenService';
import { AuthUseCases } from './useCases';

const otpProvider = new DevOtpProvider();
const tokenService = new TokenService();

export const authUseCases = new AuthUseCases(otpProvider, tokenService);

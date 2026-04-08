export class OtpService {
  private static otps: Map<string, { otp: string, expires: number }> = new Map();

  static send(phoneNumber: string): string {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 mins
    this.otps.set(phoneNumber, { otp, expires });
    
    console.log(`[OTP SERVICE] Sent OTP ${otp} to ${phoneNumber}`);
    return otp;
  }

  static verify(phoneNumber: string, otp: string): boolean {
    const data = this.otps.get(phoneNumber);
    if (!data) return false;
    
    if (Date.now() > data.expires) {
      this.otps.delete(phoneNumber);
      return false;
    }

    if (data.otp === otp) {
      this.otps.delete(phoneNumber);
      return true;
    }

    return false;
  }
}

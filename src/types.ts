export interface Member {
  id?: string;
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  faydaId?: string;
  faydaVerified?: boolean;
  status: 'pending' | 'active' | 'suspended';
  membershipType: string;
  customAttributes?: Record<string, any>;
  createdAt: string;
  otpVerified: boolean;
}

export interface Payment {
  id?: string;
  memberId: string;
  amount: number;
  currency: 'ETB';
  method: 'telebirr' | 'manual';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  receiptUrl?: string;
  createdAt: string;
  confirmedBy?: string;
}

export interface CustomAttributeDefinition {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
}

export interface OrganizationConfig {
  name: string;
  customAttributeDefinitions: CustomAttributeDefinition[];
}

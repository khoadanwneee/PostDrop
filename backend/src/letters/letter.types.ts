export type LetterStatus =
  | 'draft'
  | 'awaiting_payment'
  | 'received'
  | 'stored'
  | 'address_confirmation'
  | 'scheduled'
  | 'in_transit'
  | 'delivered';

export type DeliveryMethod = 'email' | 'physical' | 'hybrid';

export interface Letter {
  id: string;
  title: string;
  content: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  address?: string;
  deliveryDate: string;
  deliveryMethod: DeliveryMethod;
  letterType: 'online' | 'handwritten';
  paper: string;
  font: string;
  envelope: string;
  note?: string;
  status: LetterStatus;
  sealedAt?: string;
  createdAt: string;
  updatedAt: string;
  trackingCode?: string;
}

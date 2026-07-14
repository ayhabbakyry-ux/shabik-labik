
/**
 * @fileOverview تعريف الأنواع المشتركة بين السيرفر والعميل لضمان عدم حدوث تعارض SSR.
 */

export type Transaction = {
  id: string;
  external_order_id?: string;
  type: string;
  amount: number;
  status: 'Pending' | 'Completed' | 'Rejected';
  date: string;
  createdAt?: string;
  userName?: string;
  userPhone?: string;
  details?: string;
  proofImage?: string;
  balanceBefore?: number;
  balanceAfter?: number;
};

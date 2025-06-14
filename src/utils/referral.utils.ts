/**
 * Утилиты для работы с реферальной системой
 * Этот файл содержит переносимую логику, которую можно использовать в других микросервисах
 */

export interface ReferralCommissionCalculation {
  commissionAmount: number;
  adjustedServiceCommission: number;
  originalCommissionRate: number;
  referralCommissionRate: number;
}

/**
 * Вычисляет реферальную комиссию и скорректированную комиссию сервиса
 * @param transactionAmount - сумма транзакции
 * @param serviceCommissionRate - базовая комиссия сервиса (например, 0.05 = 5%)
 * @param referralCommissionRate - реферальная комиссия (например, 0.015 = 1.5%)
 * @returns объект с рассчитанными комиссиями
 */
export function calculateReferralCommission(
  transactionAmount: number,
  serviceCommissionRate: number,
  referralCommissionRate: number,
): ReferralCommissionCalculation {
  const commissionAmount = transactionAmount * referralCommissionRate;
  const adjustedServiceCommission = transactionAmount * (serviceCommissionRate - referralCommissionRate);

  return {
    commissionAmount,
    adjustedServiceCommission,
    originalCommissionRate: serviceCommissionRate,
    referralCommissionRate,
  };
}

/**
 * Генерирует уникальный реферальный код
 * @param length - длина кода (по умолчанию 8)
 * @returns реферальный код
 */
export function generateReferralCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Валидирует реферальный код на основе правил
 * @param code - код для валидации
 * @returns true если код валиден
 */
export function validateReferralCodeFormat(code: string): boolean {
  // Код должен быть строкой длиной от 4 до 16 символов, содержащей только буквы и цифры
  const codeRegex = /^[A-Z0-9]{4,16}$/;
  return codeRegex.test(code);
}

/**
 * Константы для реферальной системы
 */
export const REFERRAL_CONSTANTS = {
  DEFAULT_COMMISSION_RATE: 0.015, // 1.5%
  DEFAULT_SERVICE_COMMISSION_RATE: 0.05, // 5%
  DEFAULT_LINK_EXPIRATION_DAYS: 30,
  MIN_TRANSACTION_AMOUNT: 0.01,
  MAX_COMMISSION_RATE: 0.1, // 10%
} as const;

/**
 * Проверяет, может ли пользователь использовать реферальный код
 * @param userId - ID пользователя
 * @param referrerId - ID реферера
 * @param hasExistingReferral - есть ли у пользователя уже реферальная связь
 * @returns объект с результатом валидации
 */
export function validateReferralEligibility(
  userId: string,
  referrerId: string,
  hasExistingReferral: boolean,
): { isValid: boolean; reason?: string } {
  if (userId === referrerId) {
    return { isValid: false, reason: 'Пользователь не может использовать собственный реферальный код' };
  }

  if (hasExistingReferral) {
    return { isValid: false, reason: 'Пользователь уже участвует в реферальной программе' };
  }

  return { isValid: true };
}

/**
 * Форматирует реферальную ссылку
 * @param baseUrl - базовый URL приложения
 * @param code - реферальный код
 * @param path - путь для регистрации (по умолчанию '/register')
 * @returns отформатированную ссылку
 */
export function formatReferralLink(
  baseUrl: string,
  code: string,
  path: string = '/register',
): string {
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${cleanBaseUrl}${cleanPath}?ref=${code}`;
} 
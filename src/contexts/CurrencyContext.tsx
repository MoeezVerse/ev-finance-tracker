import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  { code: 'CLP', symbol: 'CL$', name: 'Chilean Peso' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham' },
  { code: 'COP', symbol: 'COL$', name: 'Colombian Peso' },
  { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso' },
  { code: 'PEN', symbol: 'S/.', name: 'Peruvian Sol' },
  { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
] as const;

interface CurrencyContextType {
  currency: string;
  symbol: string;
  setCurrency: (code: string) => Promise<void>;
  formatAmount: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  symbol: '$',
  setCurrency: async () => {},
  formatAmount: (amount) => `$${amount.toLocaleString()}`,
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [currency, setCurrencyState] = useState('USD');

  const currencyObj = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('currency')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.currency) setCurrencyState(data.currency);
        });
    }
  }, [user]);

  const setCurrency = useCallback(async (code: string) => {
    setCurrencyState(code);
    if (user) {
      await supabase
        .from('profiles')
        .update({ currency: code } as any)
        .eq('user_id', user.id);
    }
  }, [user]);

  const formatAmount = useCallback((amount: number) => {
    return `${currencyObj.symbol}${amount.toLocaleString()}`;
  }, [currencyObj.symbol]);

  return (
    <CurrencyContext.Provider value={{ currency, symbol: currencyObj.symbol, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
};

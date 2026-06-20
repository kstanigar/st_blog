import { supabase } from './supabase';

export async function fetchPurchases(userId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from('purchases')
    .select('product_id')
    .eq('user_id', userId);
  return new Set(data?.map((r: { product_id: string }) => r.product_id) ?? []);
}

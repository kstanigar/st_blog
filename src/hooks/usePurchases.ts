import { useEffect, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { fetchPurchases } from '../lib/purchases';

export function usePurchases() {
  const { user } = useAuthContext();
  const [purchases, setPurchases] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setPurchases(new Set());
      return;
    }
    setLoading(true);
    fetchPurchases(user.id).then((set) => {
      setPurchases(set);
      setLoading(false);
    });
  }, [user]);

  // Re-fetch after returning from Stripe Checkout (success_url includes ?success=true)
  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      fetchPurchases(user.id).then(setPurchases);
      // Clean the query param without a page reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user]);

  return { purchases, loading };
}

import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsLoad = await AsyncStorage.getItem('@GoMarketplace');

      if (productsLoad) {
        setProducts(JSON.parse(productsLoad));
      }
    }
    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const copyProducts: Product[] = products;
      const indexProduct = products.findIndex(p => p.id === id);

      if (indexProduct >= 0) {
        copyProducts[indexProduct].quantity += 1;
        setProducts([...copyProducts]);
      }
      await AsyncStorage.setItem('@GoMarketplace', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const copyProducts: Product[] = products;
      const indexProduct = products.findIndex(p => p.id === id);

      if (products[indexProduct].quantity <= 0) return;

      if (indexProduct >= 0) {
        copyProducts[indexProduct].quantity -= 1;
        setProducts([...copyProducts]);
      }
      await AsyncStorage.setItem('@GoMarketplace', JSON.stringify(products));
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const indexProduct = products.findIndex(p => p.id === product.id);

      if (indexProduct >= 0) {
        increment(product.id);
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }
      await AsyncStorage.setItem('@GoMarketplace', JSON.stringify(products));
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };

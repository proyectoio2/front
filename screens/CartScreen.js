import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../core/AuthContext';
import { apiFetch } from '../core/api';

const TITLE_COLOR = '#4CAF50';
const BROWN_COLOR = '#A0522D';

const CartScreen = () => {
  const { accessToken } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, ok } = await apiFetch('/store/cart', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!ok) throw new Error(data?.detail || 'Error al obtener el carrito');
      setCart(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTotal = () => {
    if (!cart || !cart.cart_products) return 0;
    return cart.cart_products.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  return (
    <View style={[styles.container, isDark && { backgroundColor: '#111' }]}> 
      <Text style={[styles.title, isDark && { color: '#fff' }]}>Mi Carrito</Text>
      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={TITLE_COLOR} /></View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle" size={40} color="#E53935" />
          <Text style={[styles.errorText, isDark && { color: '#fff' }]}>{error}</Text>
        </View>
      ) : cart && cart.cart_products && cart.cart_products.length > 0 ? (
        <ScrollView style={{ flex: 1 }}>
          {cart.cart_products.map(item => (
            <View key={item.id} style={[styles.productCard, isDark && styles.productCardDark]}>
              <Image source={{ uri: item.product.image_url }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={[styles.productTitle, isDark && { color: '#fff' }]}>{item.product.title}</Text>
                <Text style={[styles.productDesc, isDark && { color: '#bbb' }]} numberOfLines={2}>{item.product.description}</Text>
                <View style={styles.row}>
                  <Text style={[styles.price, isDark && { color: '#fff' }]}>${item.product.price} x {item.quantity}</Text>
                  <Text style={[styles.subtotal, isDark && { color: TITLE_COLOR }]}>Subtotal: ${item.product.price * item.quantity}</Text>
                </View>
              </View>
            </View>
          ))}
          <View style={styles.totalContainer}>
            <Text style={[styles.totalLabel, isDark && { color: '#fff' }]}>Total:</Text>
            <Text style={[styles.totalValue, isDark && { color: TITLE_COLOR }]}>${getTotal()}</Text>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.centered}>
          <Ionicons name="cart-outline" size={40} color={TITLE_COLOR} />
          <Text style={[styles.emptyText, isDark && { color: '#fff' }]}>Tu carrito está vacío</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 18, color: TITLE_COLOR, textAlign: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  errorText: { color: '#E53935', marginTop: 10, fontSize: 16 },
  emptyText: { color: '#666', marginTop: 10, fontSize: 16 },
  productCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, padding: 10, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  productCardDark: { backgroundColor: '#222' },
  productImage: { width: 70, height: 70, borderRadius: 10, marginRight: 14 },
  productInfo: { flex: 1, justifyContent: 'center' },
  productTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  productDesc: { fontSize: 13, color: '#666', marginVertical: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  price: { fontSize: 15, color: '#333' },
  subtotal: { fontSize: 14, color: TITLE_COLOR, fontWeight: 'bold' },
  totalContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, padding: 12, borderTopWidth: 1, borderColor: '#eee' },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 22, fontWeight: 'bold', color: TITLE_COLOR },
});

export default CartScreen; 
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  ActivityIndicator, 
  useColorScheme,
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
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
  const [showModal, setShowModal] = useState(false);
  const [confirmingPurchase, setConfirmingPurchase] = useState(false);

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

  // Actualiza solo la función ConfirmacCompra en tu CartScreen.js
  const ConfirmacCompra = async () => {
    try {
      setConfirmingPurchase(true);
      
      // Datos que se enviarán a tu API
      const orderData = {
        pedido: 'ORD-20250719-001',
        direccion: 'Calle 45 #12-34, Medellín',
        productos: [
          { nombre: 'Camisa blanca', cantidad: 2, precio: 90000 },
          { nombre: 'Pantalón negro', cantidad: 1, precio: 85000 }
        ],
        total: 175000,
        cliente_info: {
          // Puedes agregar más info del cliente aquí
          usuario_id: accessToken ? 'user_123' : 'guest',
          fecha_pedido: new Date().toISOString(),
          plataforma: 'mobile_app'
        }
      };

      console.log('Enviando pedido a API:', orderData);
      
      // Llamada a tu endpoint de FastAPI
      const { data, ok } = await apiFetch('/store/confirm-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      
      if (!ok) {
        throw new Error(data?.detail || 'Error al procesar la compra');
      }
      
      console.log('Respuesta de API:', data);
      
      setShowModal(false);
      
      // Mensaje de éxito personalizado
      const whatsappStatus = data.whatsapp_sent ? 
        '\n📱 Notificación WhatsApp enviada' : 
        '\n⚠️ Pedido procesado (WhatsApp pendiente)';
      
      Alert.alert(
        'Compra Confirmada ✅',
        `Pedido: ${data.pedido_id}\nTotal: $${orderData.total.toLocaleString()}\n\n¡Tu pedido ha sido procesado exitosamente!${whatsappStatus}`,
        [{ text: 'OK' }]
      );
      
      // Opcional: Limpiar el carrito después de la compra exitosa
      // fetchCart(); // Recargar carrito
      
    } catch (err) {
      console.error('Error en ConfirmacCompra:', err);
      Alert.alert(
        'Error al procesar compra', 
        err.message || 'No se pudo procesar tu compra. Intenta nuevamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setConfirmingPurchase(false);
    }
  };

  const openConfirmModal = () => {
    if (cart && cart.cart_products && cart.cart_products.length > 0) {
      setShowModal(true);
    }
  };

  // --- NUEVAS FUNCIONES PARA EDITAR EL CARRITO ---
  const updateQuantity = async (product_id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await apiFetch('/store/cart/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id, quantity: newQuantity }),
      });
      fetchCart();
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar la cantidad.');
    }
  };

  const removeProduct = async (product_id) => {
    try {
      await apiFetch('/store/cart/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id }),
      });
      fetchCart();
    } catch (err) {
      Alert.alert('Error', 'No se pudo eliminar el producto.');
    }
  };

  const clearCart = async () => {
    try {
      await apiFetch('/store/cart/clear', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      fetchCart();
    } catch (err) {
      Alert.alert('Error', 'No se pudo vaciar el carrito.');
    }
  };

  return (
    <View style={[styles.container, isDark && { backgroundColor: '#111' }]}> 
      <Text style={[styles.title, isDark && { color: '#fff' }]}>Mi Carrito</Text>
      
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={TITLE_COLOR} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle" size={40} color="#E53935" />
          <Text style={[styles.errorText, isDark && { color: '#fff' }]}>{error}</Text>
        </View>
      ) : cart && cart.cart_products && cart.cart_products.length > 0 ? (
        <>
          {/* Botón para vaciar carrito */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#E53935',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              width: '100%',
              shadowColor: '#000',
              shadowOpacity: 0.12,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={clearCart}
            activeOpacity={0.85}
          >
            <Ionicons name="trash" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Vaciar carrito</Text>
          </TouchableOpacity>

          <ScrollView style={{ flex: 1 }}>
            {cart.cart_products.map(item => (
              <View key={item.id} style={[styles.productCard, isDark && styles.productCardDark]}>
                <Image source={{ uri: item.product.image_url }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={[styles.productTitle, isDark && { color: '#fff' }]}> {item.product.title} </Text>
                  <Text style={[styles.productDesc, isDark && { color: '#bbb' }]} numberOfLines={2}> {item.product.description} </Text>
                  <View style={styles.row}>
                    <Text style={[styles.price, isDark && { color: '#fff' }]}> Bs{item.product.price} </Text>
                    {/* Controles de cantidad */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <TouchableOpacity
                        style={{ padding: 6, backgroundColor: '#eee', borderRadius: 8 }}
                        onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Ionicons name="remove" size={18} color="#333" />
                      </TouchableOpacity>
                      <Text style={{ minWidth: 24, textAlign: 'center', color: isDark ? '#fff' : '#333', fontWeight: 'bold' }}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={{ padding: 6, backgroundColor: '#eee', borderRadius: 8 }}
                        onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Ionicons name="add" size={18} color="#333" />
                      </TouchableOpacity>
                      {/* Botón eliminar producto */}
                      <TouchableOpacity
                        style={{ marginLeft: 8, padding: 6, backgroundColor: '#E53935', borderRadius: 8 }}
                        onPress={() => removeProduct(item.product.id)}
                      >
                        <Ionicons name="trash" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={[styles.subtotal, isDark && { color: TITLE_COLOR }]}> Subtotal: Bs{item.product.price * item.quantity} </Text>
                </View>
              </View>
            ))}

            <View style={styles.totalContainer}>
              <Text style={[styles.totalLabel, isDark && { color: '#fff' }]}>Total:</Text>
              <Text style={[styles.totalValue, isDark && { color: TITLE_COLOR }]}>Bs{getTotal()}</Text>
            </View>
          </ScrollView>
          
          {/* Botón de Confirmar Compra */}
          <TouchableOpacity 
            style={[styles.confirmButton, isDark && styles.confirmButtonDark]} 
            onPress={openConfirmModal}
            activeOpacity={0.8}
          >
            <Ionicons name="card" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.confirmButtonText}>Confirmar Compra</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.centered}>
          <Ionicons name="cart-outline" size={40} color={TITLE_COLOR} />
          <Text style={[styles.emptyText, isDark && { color: '#fff' }]}>Tu carrito está vacío</Text>
        </View>
      )}

      {/* Modal de Confirmación */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => !confirmingPurchase && setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, isDark && { color: '#fff' }]}>
              Confirmar Pedido
            </Text>
            
            <View style={styles.orderSummary}>
              <Text style={[styles.summaryLabel, isDark && { color: '#fff' }]}>
                🧾 Pedido: <Text style={styles.summaryValue}>ORD-20250719-001</Text>
              </Text>
              <Text style={[styles.summaryLabel, isDark && { color: '#fff' }]}>
                📍 Dirección: <Text style={styles.summaryValue}>Calle 45 #12-34, Medellín</Text>
              </Text>
              <Text style={[styles.summaryLabel, isDark && { color: '#fff' }]}>📦 Productos:</Text>
              <Text style={[styles.productItem, isDark && { color: '#bbb' }]}>
                • 2x Camisa blanca — $90.000
              </Text>
              <Text style={[styles.productItem, isDark && { color: '#bbb' }]}>
                • 1x Pantalón negro — $85.000
              </Text>
              <Text style={[styles.totalSummary, isDark && { color: TITLE_COLOR }]}>
                💰 Total a pagar: $175.000
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.cancelButton, isDark && styles.cancelButtonDark]}
                onPress={() => setShowModal(false)}
                disabled={confirmingPurchase}
              >
                <Text style={[styles.cancelButtonText, isDark && { color: '#fff' }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmModalButton, confirmingPurchase && styles.confirmModalButtonDisabled]}
                onPress={ConfirmacCompra}
                disabled={confirmingPurchase}
              >
                {confirmingPurchase ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.confirmModalButtonText}>Confirmar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 18, color: TITLE_COLOR, textAlign: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  errorText: { color: '#E53935', marginTop: 10, fontSize: 16 },
  emptyText: { color: '#666', marginTop: 10, fontSize: 16 },
  productCard: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    marginBottom: 16, 
    padding: 10, 
    shadowColor: '#000', 
    shadowOpacity: 0.08, 
    shadowRadius: 4, 
    elevation: 2 
  },
  productCardDark: { backgroundColor: '#222' },
  productImage: { width: 70, height: 70, borderRadius: 10, marginRight: 14 },
  productInfo: { flex: 1, justifyContent: 'center' },
  productTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  productDesc: { fontSize: 13, color: '#666', marginVertical: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  price: { fontSize: 15, color: '#333' },
  subtotal: { fontSize: 14, color: TITLE_COLOR, fontWeight: 'bold' },
  totalContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 24, 
    padding: 12, 
    borderTopWidth: 1, 
    borderColor: '#eee' 
  },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 22, fontWeight: 'bold', color: TITLE_COLOR },
  
  // Estilos del botón confirmar
  confirmButton: {
    backgroundColor: TITLE_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonDark: {
    backgroundColor: TITLE_COLOR,
  },
  buttonIcon: {
    marginRight: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalContentDark: {
    backgroundColor: '#222',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  orderSummary: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  summaryLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#333',
  },
  productItem: {
    fontSize: 14,
    marginLeft: 16,
    marginBottom: 4,
    color: '#666',
  },
  totalSummary: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    color: TITLE_COLOR,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonDark: {
    backgroundColor: '#333',
    borderColor: '#555',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmModalButton: {
    flex: 1,
    backgroundColor: TITLE_COLOR,
    padding: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmModalButtonDisabled: {
    backgroundColor: '#999',
  },
  confirmModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;
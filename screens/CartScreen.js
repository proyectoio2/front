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
  Alert,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../core/AuthContext';
import { apiFetch } from '../core/api';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const TITLE_COLOR = '#4CAF50';
const BROWN_COLOR = '#A0522D';

const CartScreen = () => {
  const { accessToken } = useAuth();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmingPurchase, setConfirmingPurchase] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Animaciones
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

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

  const showSuccessAnimation = () => {
    setShowSuccessModal(true);

    // Animación de entrada
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // NO hay auto-cierre automático
    // El usuario debe presionar "Continuar" para cerrar
  };

  const hideSuccessModal = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSuccessModal(false);
      // Resetear animaciones
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      slideAnim.setValue(50);

      // Volver a la pantalla anterior (como el botón de volver atrás)
      navigation.goBack();
    });
  };

  const ConfirmacCompra = async () => {
    try {
      setConfirmingPurchase(true);

      const { data: resp, ok } = await apiFetch('/store/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!ok) throw new Error(resp?.detail || 'Error al procesar la compra');

      // Guardar mensaje de éxito
      setSuccessMessage(resp?.message || 'Compra realizada y confirmada por WhatsApp');

      // Limpiar carrito localmente
      setCart({ cart_products: [] });

      // Mostrar animación de éxito (SIN auto-cierre)
      showSuccessAnimation();

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
    Alert.alert(
        'Vaciar Carrito',
        '¿Estás seguro de que quieres eliminar todos los productos?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Vaciar',
            style: 'destructive',
            onPress: async () => {
              try {
                await apiFetch('/store/cart/clear', {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                });
                fetchCart();
              } catch (err) {
                Alert.alert('Error', 'No se pudo vaciar el carrito.');
              }
            }
          }
        ]
    );
  };

  const renderSuccessModal = () => (
      <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="none"
          onRequestClose={hideSuccessModal}
      >
        <View style={styles.successOverlay}>
          <Animated.View
              style={[
                styles.successContainer,
                {
                  transform: [
                    { scale: scaleAnim },
                    { translateY: slideAnim }
                  ],
                  opacity: fadeAnim,
                },
                isDark && styles.successContainerDark
              ]}
          >
            {/* Icono de éxito animado */}
            <View style={styles.successIconContainer}>
              <Animated.View
                  style={[
                    styles.successIcon,
                    {
                      transform: [{ scale: scaleAnim }]
                    }
                  ]}
              >
                <Ionicons name="checkmark-circle" size={80} color={TITLE_COLOR} />
              </Animated.View>
            </View>

            {/* Título */}
            <Animated.Text
                style={[
                  styles.successTitle,
                  { opacity: fadeAnim },
                  isDark && { color: '#fff' }
                ]}
            >
              ¡Compra Exitosa! 🎉
            </Animated.Text>

            {/* Mensaje */}
            <Animated.Text
                style={[
                  styles.successMessage,
                  { opacity: fadeAnim },
                  isDark && { color: '#bbb' }
                ]}
            >
              {successMessage}
            </Animated.Text>

            {/* Información adicional */}
            <Animated.View
                style={[
                  styles.successInfo,
                  { opacity: fadeAnim }
                ]}
            >
              <View style={styles.successInfoRow}>
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                <Text style={[styles.successInfoText, isDark && { color: '#bbb' }]}>
                  Recibirás confirmación por WhatsApp
                </Text>
              </View>
              <View style={styles.successInfoRow}>
                <Ionicons name="time" size={20} color={TITLE_COLOR} />
                <Text style={[styles.successInfoText, isDark && { color: '#bbb' }]}>
                  Tu pedido está siendo procesado
                </Text>
              </View>
            </Animated.View>

            {/* Botón para continuar (MANUAL) */}
            <TouchableOpacity
                style={styles.successButton}
                onPress={hideSuccessModal}
                activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.successButtonText}>Continuar</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
  );

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
                  style={styles.clearCartButton}
                  onPress={clearCart}
                  activeOpacity={0.85}
              >
                <Ionicons name="trash" size={22} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.clearCartText}>Vaciar carrito</Text>
              </TouchableOpacity>

              <ScrollView style={{ flex: 1 }}>
                {cart.cart_products.map(item => (
                    <View key={item.id} style={[styles.productCard, isDark && styles.productCardDark]}>
                      <Image source={{ uri: item.product.image_url }} style={styles.productImage} />
                      <View style={styles.productInfo}>
                        <Text style={[styles.productTitle, isDark && { color: '#fff' }]}>
                          {item.product.title}
                        </Text>
                        <Text style={[styles.productDesc, isDark && { color: '#bbb' }]} numberOfLines={2}>
                          {item.product.description}
                        </Text>
                        <View style={styles.row}>
                          <Text style={[styles.price, isDark && { color: '#fff' }]}>
                            Bs{item.product.price}
                          </Text>
                          {/* Controles de cantidad */}
                          <View style={styles.quantityControls}>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Ionicons name="remove" size={18} color="#333" />
                            </TouchableOpacity>
                            <Text style={[styles.quantityText, isDark && { color: '#fff' }]}>
                              {item.quantity}
                            </Text>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Ionicons name="add" size={18} color="#333" />
                            </TouchableOpacity>
                            {/* Botón eliminar producto */}
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removeProduct(item.product.id)}
                            >
                              <Ionicons name="trash" size={18} color="#fff" />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <Text style={[styles.subtotal, isDark && { color: TITLE_COLOR }]}>
                          Subtotal: Bs{item.product.price * item.quantity}
                        </Text>
                      </View>
                    </View>
                ))}

                <View style={styles.totalContainer}>
                  <Text style={[styles.totalLabel, isDark && { color: '#fff' }]}>Total:</Text>
                  <Text style={[styles.totalValue, isDark && { color: TITLE_COLOR }]}>
                    Bs{getTotal()}
                  </Text>
                </View>
              </ScrollView>

              {/* Botón de Confirmar Compra */}
              <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    isDark && styles.confirmButtonDark,
                    confirmingPurchase && styles.confirmButtonDisabled
                  ]}
                  onPress={ConfirmacCompra}
                  activeOpacity={0.8}
                  disabled={confirmingPurchase}
              >
                {confirmingPurchase ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.confirmButtonText}>Procesando...</Text>
                    </>
                ) : (
                    <>
                      <Ionicons name="card" size={24} color="#fff" style={styles.buttonIcon} />
                      <Text style={styles.confirmButtonText}>Confirmar Compra</Text>
                    </>
                )}
              </TouchableOpacity>
            </>
        ) : (
            <View style={styles.centered}>
              <Ionicons name="cart-outline" size={60} color={TITLE_COLOR} />
              <Text style={[styles.emptyText, isDark && { color: '#fff' }]}>
                Tu carrito está vacío
              </Text>
              <TouchableOpacity
                  style={styles.shopButton}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.8}
              >
                <Text style={styles.shopButtonText}>Volver a comprar</Text>
              </TouchableOpacity>
            </View>
        )}

        {/* Modal de éxito */}
        {renderSuccessModal()}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 18,
    color: TITLE_COLOR,
    textAlign: 'center'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40
  },
  errorText: {
    color: '#E53935',
    marginTop: 10,
    fontSize: 16
  },
  emptyText: {
    color: '#666',
    marginTop: 10,
    fontSize: 18,
    textAlign: 'center'
  },
  shopButton: {
    backgroundColor: TITLE_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Clear cart button
  clearCartButton: {
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
  },
  clearCartText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },

  // Product cards
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
  productCardDark: {
    backgroundColor: '#222'
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 14
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  productTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333'
  },
  productDesc: {
    fontSize: 13,
    color: '#666',
    marginVertical: 2
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6
  },
  price: {
    fontSize: 15,
    color: '#333'
  },
  subtotal: {
    fontSize: 14,
    color: TITLE_COLOR,
    fontWeight: 'bold'
  },

  // Quantity controls
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  quantityButton: {
    padding: 6,
    backgroundColor: '#eee',
    borderRadius: 8
  },
  quantityText: {
    minWidth: 24,
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold'
  },
  removeButton: {
    marginLeft: 8,
    padding: 6,
    backgroundColor: '#E53935',
    borderRadius: 8
  },

  // Total
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#eee'
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: TITLE_COLOR
  },

  // Confirm button
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
  confirmButtonDisabled: {
    backgroundColor: '#999',
  },
  buttonIcon: {
    marginRight: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Success Modal
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: width * 0.9,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  successContainerDark: {
    backgroundColor: '#222',
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  successInfo: {
    width: '100%',
    marginBottom: 25,
  },
  successInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  successInfoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  successButton: {
    backgroundColor: TITLE_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  successButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;
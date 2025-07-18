import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, ScrollView, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../core/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../core/api';

const TITLE_COLOR = '#4CAF50';
const BROWN_COLOR = '#A0522D';

const Home = () => {
  const { accessToken } = useAuth();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (accessToken) {
      console.log("Access Token en Home:", accessToken);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/store/products`);
      console.log('Respuesta del servidor:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Productos obtenidos:', data);
      
      setProducts(data);
    } catch (err) {
      console.error('Error al obtener productos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openSocialLink = (url) => {
    Linking.openURL(url).catch(err => console.error('Error al abrir enlace:', err));
  };

  const addToCart = (productId) => {
    setCartCount(prev => prev + 1);
    // Aquí puedes agregar la lógica para agregar al carrito
    console.log('Agregando producto al carrito:', productId);
  };

  const renderProduct = (product) => (
    <View key={product.id} style={[styles.productCard, isDark && styles.productCardDark]}>
      <View style={styles.productImageContainer}>
        {product.image_url ? (
          <Image 
            source={{ uri: product.image_url }} 
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.productImagePlaceholder, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}>
            <Ionicons name="flask" size={60} color={TITLE_COLOR} />
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={[styles.productTitle, isDark && { color: '#fff' }]}>
          {product.title}
        </Text>
        
        <Text style={[styles.productDescription, isDark && { color: '#bbb' }]} numberOfLines={3}>
          {product.description}
        </Text>
        
        <View style={styles.productDetails}>
          <View style={styles.priceStockContainer}>
            <Text style={[styles.productPrice, isDark && { color: '#fff' }]}>
              ${product.price}
            </Text>
            <Text style={[styles.productStock, isDark && { color: '#bbb' }]}>
              Stock: {product.stock}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.addToCartButton, { opacity: product.stock > 0 ? 1 : 0.5 }]}
            onPress={() => addToCart(product.id)}
            disabled={product.stock <= 0}
          >
            <Ionicons name="cart" size={16} color="#fff" />
            <Text style={styles.addToCartText}>
              {product.stock > 0 ? 'Agregar' : 'Sin Stock'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, isDark && { backgroundColor: '#111' }]}>
      <View style={[styles.content, { paddingHorizontal: 24 }, { paddingTop: 20 }]}>
        
        {/* Header con Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="leaf" size={40} color={TITLE_COLOR} />
            <Text style={[styles.logoText, isDark && { color: '#fff' }]}>EcoStylo</Text>
          </View>
          <TouchableOpacity style={styles.cartButton}>
            <Ionicons name="cart" size={24} color={isDark ? '#fff' : '#333'} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Sección Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroGradient}>
            <View style={styles.heroIconContainer}>
              <Ionicons name="leaf" size={50} color="#fff" />
            </View>
            <Text style={styles.heroTitle}>
              EcoStylo
            </Text>
            <Text style={styles.heroSubtitle}>
              Belleza Natural • Artesanal • Sostenible
            </Text>
            <View style={styles.heroBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.heroBadgeText}>100% Natural</Text>
            </View>
          </View>
        </View>

        {/* Beneficios Principales */}
        <View style={styles.benefitsSection}>
          <Text style={[styles.sectionTitle, isDark && { color: '#fff' }]}>
            ¿Por qué elegir EcoStylo?
          </Text>
          
          <View style={styles.benefitsGrid}>
            <View style={[
              styles.benefitCard, 
              styles.benefitCard1,
              isDark && {
                backgroundColor: 'rgba(76, 175, 80, 0.3)',
                borderColor: '#4CAF50',
                borderWidth: 1,
              }
            ]}>
              <View style={[
                styles.benefitIconContainer,
                isDark && { backgroundColor: 'rgba(255,255,255,0.15)' }
              ]}>
                <Ionicons name="shield-checkmark" size={28} color="#fff" />
              </View>
              <Text style={[
                styles.benefitTitle,
                isDark && { color: '#fff' }
              ]}>100% Natural</Text>
              <Text style={[
                styles.benefitDescription,
                isDark && { color: '#ccc' }
              ]}>Sin químicos agresivos</Text>
            </View>
            
            <View style={[
              styles.benefitCard, 
              styles.benefitCard2,
              isDark && {
                backgroundColor: 'rgba(160, 82, 45, 0.3)',
                borderColor: '#A0522D',
                borderWidth: 1,
              }
            ]}>
              <View style={[
                styles.benefitIconContainer,
                isDark && { backgroundColor: 'rgba(255,255,255,0.15)' }
              ]}>
                <Ionicons name="heart" size={28} color="#fff" />
              </View>
              <Text style={[
                styles.benefitTitle,
                isDark && { color: '#fff' }
              ]}>Seguro</Text>
              <Text style={[
                styles.benefitDescription,
                isDark && { color: '#ccc' }
              ]}>Para toda la familia</Text>
            </View>
            
            <View style={[
              styles.benefitCard, 
              styles.benefitCard3,
              isDark && {
                backgroundColor: 'rgba(160, 82, 45, 0.3)',
                borderColor: '#A0522D',
                borderWidth: 1,
              }
            ]}>
              <View style={[
                styles.benefitIconContainer,
                isDark && { backgroundColor: 'rgba(255,255,255,0.15)' }
              ]}>
                <Ionicons name="diamond" size={28} color="#fff" />
              </View>
              <Text style={[
                styles.benefitTitle,
                isDark && { color: '#fff' }
              ]}>Eco-Lujo</Text>
              <Text style={[
                styles.benefitDescription,
                isDark && { color: '#ccc' }
              ]}>Belleza sostenible</Text>
            </View>
            
            <View style={[
              styles.benefitCard, 
              styles.benefitCard4,
              isDark && {
                backgroundColor: 'rgba(76, 175, 80, 0.3)',
                borderColor: '#4CAF50',
                borderWidth: 1,
              }
            ]}>
              <View style={[
                styles.benefitIconContainer,
                isDark && { backgroundColor: 'rgba(255,255,255,0.15)' }
              ]}>
                <Ionicons name="hand-left" size={28} color="#fff" />
              </View>
              <Text style={[
                styles.benefitTitle,
                isDark && { color: '#fff' }
              ]}>Artesanal</Text>
              <Text style={[
                styles.benefitDescription,
                isDark && { color: '#ccc' }
              ]}>Hecho con amor</Text>
            </View>
          </View>
        </View>

        {/* Lista de Productos */}
        <View style={styles.productsSection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingSpinner}>
                <Ionicons name="refresh" size={30} color={TITLE_COLOR} />
              </View>
              <Text style={[styles.loadingText, isDark && { color: '#fff' }]}>
                Cargando productos...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <View style={styles.errorIcon}>
                <Ionicons name="alert-circle" size={40} color="#E53935" />
              </View>
              <Text style={[styles.errorText, isDark && { color: '#fff' }]}>
                Error al cargar productos
              </Text>
            </View>
          ) : products && products.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Ionicons name="bag" size={24} color="#fff" />
                </View>
                <Text style={[styles.sectionTitle, isDark && { color: '#fff' }]}>
                  Nuestros Productos
                </Text>
                <View style={styles.productCount}>
                  <Text style={styles.productCountText}>{products.length}</Text>
                </View>
              </View>
              {products.map(renderProduct)}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="bag" size={40} color={TITLE_COLOR} />
              </View>
              <Text style={[styles.emptyText, isDark && { color: '#fff' }]}>
                Próximamente más productos
              </Text>
            </View>
          )}
        </View>

        {/* Proceso Visual */}
        <View style={styles.processSection}>
          <Text style={[styles.sectionTitle, isDark && { color: '#fff' }]}>
            Nuestro Proceso
          </Text>
          
          <View style={styles.processTimeline}>
            <View style={styles.processStep}>
              <View style={[
                styles.processIcon,
                isDark && { backgroundColor: '#4CAF50' }
              ]}>
                <Ionicons name="leaf" size={24} color="#fff" />
              </View>
              <Text style={[
                styles.processLabel,
                isDark && { color: '#fff', fontWeight: 'bold' }
              ]}>Natural</Text>
            </View>
            
            <View style={styles.processLine}>
              <Ionicons name="arrow-forward" size={20} color={TITLE_COLOR} />
            </View>
            
            <View style={styles.processStep}>
              <View style={[
                styles.processIcon,
                isDark && { backgroundColor: '#4CAF50' }
              ]}>
                <Ionicons name="hand-left" size={24} color="#fff" />
              </View>
              <Text style={[
                styles.processLabel,
                isDark && { color: '#fff', fontWeight: 'bold' }
              ]}>Artesanal</Text>
            </View>
            
            <View style={styles.processLine}>
              <Ionicons name="arrow-forward" size={20} color={TITLE_COLOR} />
            </View>
            
            <View style={styles.processStep}>
              <View style={[
                styles.processIcon,
                isDark && { backgroundColor: '#4CAF50' }
              ]}>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
              </View>
              <Text style={[
                styles.processLabel,
                isDark && { color: '#fff', fontWeight: 'bold' }
              ]}>Calidad</Text>
            </View>
          </View>
        </View>

        {/* Redes sociales */}
        <View style={styles.socialSection}>
          <Text style={[styles.sectionTitle, isDark && { color: '#fff' }]}>
            Síguenos
          </Text>
          
          <View style={styles.socialGrid}>
            <TouchableOpacity 
              style={[styles.socialCard, { backgroundColor: '#E4405F' }]}
              onPress={() => openSocialLink('https://www.instagram.com/GelNatAloeVera123')}
            >
              <Ionicons name="logo-instagram" size={22} color="#fff" />
              <Text style={styles.socialText}>Instagram</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialCard, { backgroundColor: '#010101' }]}
              onPress={() => openSocialLink('https://www.tiktok.com/@grupoaloevera7')}
            >
              <Ionicons name="logo-tiktok" size={22} color="#fff" />
              <Text style={styles.socialText}>TikTok</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialCard, { backgroundColor: '#1877F2' }]}
              onPress={() => openSocialLink('https://www.facebook.com/share/1CXBfmbzVZ/?mibextid=wwXIfr')}
            >
              <Ionicons name="logo-facebook" size={22} color="#fff" />
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialCard, { backgroundColor: '#00C851' }]}
              onPress={() => openSocialLink('https://linktr.ee/TESLAQUINCE')}
            >
              <Ionicons name="link" size={22} color="#fff" />
              <Text style={styles.socialText}>Linktree</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TITLE_COLOR,
    marginLeft: 10,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#E53935',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  heroGradient: {
    width: '100%',
    height: 250,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: TITLE_COLOR,
    position: 'relative',
  },
  heroIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 15,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  benefitsSection: {
    marginBottom: 30,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 20,
  },
  benefitCard: {
    width: '45%', // Adjust as needed for grid layout
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  benefitCardDark: {
    backgroundColor: '#222',
  },
  benefitCard1: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  benefitCard2: {
    backgroundColor: 'rgba(160, 82, 45, 0.1)',
  },
  benefitCard3: {
    backgroundColor: 'rgba(160, 82, 45, 0.1)',
  },
  benefitCard4: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  benefitIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  benefitDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  productsSection: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  productCount: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  productCountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: TITLE_COLOR,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  productCardDark: {
    backgroundColor: '#222',
  },
  productImageContainer: {
    width: '100%',
    height: 200,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 20,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceStockContainer: {
    flex: 1,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TITLE_COLOR,
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    color: '#666',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TITLE_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(229, 57, 53, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#E53935',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  processSection: {
    marginBottom: 30,
  },
  processTimeline: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 20,
  },
  processStep: {
    alignItems: 'center',
  },
  processIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  processLabel: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    fontWeight: 'normal',
  },
  processLine: {
    marginHorizontal: 10,
  },
  socialSection: {
    marginBottom: 30,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 8,
  },
  socialCard: {
    width: 70,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  socialCardDark: {
    backgroundColor: '#222',
  },
  socialText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default Home;

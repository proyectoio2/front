import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  Linking,
  Image,
  Dimensions,
  Modal,
  Animated,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../core/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL, apiFetch } from '../core/api';

const { width, height } = Dimensions.get('window');

// Colores optimizados para gel capilar
const COLORS = {
  primary: '#2E7D32',      // Verde aloe vera
  secondary: '#FF6B35',    // Naranja para CTAs
  accent: '#4CAF50',       // Verde claro
  success: '#66BB6A',
  warning: '#FF9800',
  error: '#F44336',
  light: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
    shadow: '#000000',
  },
  dark: {
    background: '#0A0A0A',
    surface: '#1A1A1A',
    card: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    border: '#404040',
    shadow: '#000000',
  }
};

// Datos detallados de beneficios
const BENEFITS_DATA = {
  'Hidratación': {
    icon: 'water',
    title: 'Hidratación Profunda',
    shortDesc: 'Cabello suave y sedoso',
    color: COLORS.primary,
    details: [
      'El aloe vera contiene 99% de agua natural que penetra profundamente en el cabello',
      'Restaura la humedad perdida por factores ambientales y químicos',
      'Mantiene el cabello hidratado por hasta 24 horas',
      'Reduce la sequedad y la caspa causada por falta de hidratación'
    ],
    benefits: [
      'Cabello más suave al tacto',
      'Reducción del frizz',
      'Mayor manejabilidad',
      'Brillo natural duradero'
    ],
    howItWorks: 'Los polisacáridos del aloe vera forman una película protectora que retiene la humedad natural del cabello, mientras que sus aminoácidos nutren desde la raíz.',
    tips: [
      'Aplica en cabello húmedo para mejor absorción',
      'Masajea suavemente desde medios a puntas',
      'Usa 2-3 veces por semana para resultados óptimos'
    ]
  },
  'Protección': {
    icon: 'shield-checkmark',
    title: 'Protección Avanzada',
    shortDesc: 'Contra daño ambiental',
    color: COLORS.success,
    details: [
      'Crea una barrera natural contra rayos UV dañinos',
      'Protege del calor de herramientas de peinado',
      'Previene el daño causado por contaminación ambiental',
      'Fortalece la cutícula capilar contra agresiones externas'
    ],
    benefits: [
      'Cabello protegido del sol',
      'Menor daño por calor',
      'Resistencia a factores ambientales',
      'Prevención de decoloración'
    ],
    howItWorks: 'Los antioxidantes naturales del aloe vera neutralizan los radicales libres, mientras que sus mucílagos crean una capa protectora invisible.',
    tips: [
      'Aplica antes de exposición solar',
      'Úsalo como protector térmico natural',
      'Ideal para cabello teñido o tratado'
    ]
  },
  'Fortalece': {
    icon: 'flash',
    title: 'Fortalecimiento Integral',
    shortDesc: 'Desde la raíz',
    color: COLORS.secondary,
    details: [
      'Estimula la circulación sanguínea en el cuero cabelludo',
      'Aporta vitaminas A, C, E y complejo B esenciales',
      'Fortalece la estructura interna del cabello',
      'Reduce la caída y promueve el crecimiento saludable'
    ],
    benefits: [
      'Cabello más resistente',
      'Menos quiebre y caída',
      'Crecimiento más rápido',
      'Raíces más fuertes'
    ],
    howItWorks: 'Las enzimas proteolíticas del aloe vera mejoran la absorción de nutrientes, mientras que sus minerales fortalecen la estructura capilar desde adentro.',
    tips: [
      'Masajea el cuero cabelludo al aplicar',
      'Deja actuar 10-15 minutos antes de peinar',
      'Combina con una dieta rica en proteínas'
    ]
  },
  'Brillo Natural': {
    icon: 'sparkles',
    title: 'Brillo Radiante',
    shortDesc: 'Sin químicos agresivos',
    color: COLORS.accent,
    details: [
      'Alisa la cutícula capilar para reflejar mejor la luz',
      'Elimina residuos que opacan el cabello',
      'Aporta luminosidad natural sin siliconas',
      'Restaura el brillo perdido por tratamientos químicos'
    ],
    benefits: [
      'Brillo natural y duradero',
      'Cabello más luminoso',
      'Apariencia saludable',
      'Sin efecto graso'
    ],
    howItWorks: 'Los aminoácidos del aloe vera rellenan las micro-fisuras de la cutícula, creando una superficie lisa que refleja la luz de manera uniforme.',
    tips: [
      'Aplica en cabello limpio para mejor resultado',
      'Evita el exceso para no crear peso',
      'Combina con agua fría en el último enjuague'
    ]
  }
};

const Home = () => {
  const { accessToken } = useAuth();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = COLORS[isDark ? 'dark' : 'light'];

  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const productsSectionRef = useRef(null);
  const [productsY, setProductsY] = useState(0);

  // Estados para el modal de beneficios
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [modalAnimation] = useState(new Animated.Value(0));
  const [contentAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (accessToken) {
      console.log("Access Token en Home:", accessToken);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchCartCount();
      const interval = setInterval(fetchCartCount, 15000);
      return () => clearInterval(interval);
    }
  }, [accessToken]);

  const fetchCartCount = async () => {
    try {
      const { data, ok } = await apiFetch('/store/cart', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (ok && data && data.cart_products) {
        const total = data.cart_products.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(total);
      } else {
        setCartCount(0);
      }
    } catch (err) {
      setCartCount(0);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/store/products`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error al obtener productos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir el modal de beneficios
  const openBenefitsModal = (benefitTitle) => {
    const benefitData = BENEFITS_DATA[benefitTitle];
    console.log('[DEBUG] openBenefitsModal:', benefitTitle, benefitData);
    if (benefitData) {
      setSelectedBenefit(benefitData);
      setShowBenefitsModal(true);

      // Animaciones de entrada
      Animated.parallel([
        Animated.timing(modalAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(contentAnimation, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Función para cerrar el modal
  const closeBenefitsModal = () => {
    Animated.parallel([
      Animated.timing(modalAnimation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowBenefitsModal(false);
      setSelectedBenefit(null);
    });
  };

  const openSocialLink = (url) => {
    Linking.openURL(url).catch(err => console.error('Error al abrir enlace:', err));
  };

  const addToCart = async (productId) => {
    try {
      await apiFetch('/store/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      fetchCartCount();
    } catch (err) {
      console.error('Error al agregar al carrito:', err);
    }
  };

  const onProductsLayout = (event) => {
    setProductsY(event.nativeEvent.layout.y);
  };

  const scrollToProducts = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: productsY - 20, animated: true });
    }
  };

  // Renderizar el modal de beneficios
  const renderBenefitsModal = () => {
    if (!selectedBenefit) return null;
    console.log('[DEBUG] renderBenefitsModal selectedBenefit:', selectedBenefit);
    return (
      <Modal
        visible={showBenefitsModal}
        transparent={true}
        animationType="none"
        onRequestClose={closeBenefitsModal}
        statusBarTranslucent={true}
        hardwareAccelerated={true}
      >
        <StatusBar backgroundColor="rgba(0,0,0,0.7)" barStyle="light-content" />
        <Animated.View
          style={[
            styles.modalOverlay,
            { opacity: modalAnimation }
          ]}
        >
          {/* Botón de cierre de fondo */}
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={closeBenefitsModal}
            activeOpacity={1}
          />
          <Animated.View
            style={[
              styles.modalContainer,
              {
                backgroundColor: theme.surface,
                minHeight: 350, // Asegura altura mínima para móviles
                transform: [
                  {
                    scale: contentAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    })
                  },
                  {
                    translateY: contentAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    })
                  }
                ],
                opacity: contentAnimation,
              }
            ]}
          >
            {/* Header del modal */}
            <View style={[styles.modalHeader, { backgroundColor: selectedBenefit.color }]}> 
              <View style={styles.modalHeaderContent}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name={selectedBenefit.icon} size={32} color="#FFF" />
                </View>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>{selectedBenefit.title}</Text>
                  <Text style={styles.modalSubtitle}>{selectedBenefit.shortDesc}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeBenefitsModal}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Texto de prueba fuera del ScrollView */}
            {/* <Text style={{ color: 'red', textAlign: 'center' }}>PRUEBA FUERA DEL SCROLLVIEW</Text> */}

            {/* Contenido del modal - MEJORADO PARA ANDROID */}
            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
              bounces={true}
              nestedScrollEnabled={true}
              removeClippedSubviews={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            >
              {/* DEBUG: Mostrar datos del beneficio en la APK */}
              {/*
              <View style={{ backgroundColor: '#222', padding: 16, borderRadius: 12, marginBottom: 16, minHeight: 120, maxHeight: 300 }}>
                <ScrollView>
                  <Text style={{ color: '#fff', fontSize: 14 }}>
                    [DEBUG] selectedBenefit:{"\n"}
                    {JSON.stringify(selectedBenefit, null, 2)}
                  </Text>
                </ScrollView>
              </View>
              */}
              {/* Descripción principal */}
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>¿Cómo funciona?</Text>
                <Text style={[styles.modalDescription, { color: theme.textSecondary }]}> {selectedBenefit.howItWorks} </Text>
              </View>
              {/* Detalles */}
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Detalles del beneficio</Text>
                {selectedBenefit.details && selectedBenefit.details.map((detail, index) => (
                  <View key={`detail-${index}`} style={styles.detailItem}>
                    <View style={[styles.detailBullet, { backgroundColor: selectedBenefit.color }]} />
                    <Text style={[styles.detailText, { color: theme.textSecondary }]}> {detail} </Text>
                  </View>
                ))}
              </View>
              {/* Beneficios específicos */}
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Resultados que notarás</Text>
                <View style={styles.benefitsGrid}>
                  {selectedBenefit.benefits && selectedBenefit.benefits.map((benefit, index) => (
                    <View key={`benefit-${index}`} style={[styles.benefitItem, { backgroundColor: theme.background }]}> 
                      <Ionicons name="checkmark-circle" size={20} color={selectedBenefit.color} />
                      <Text style={[styles.benefitItemText, { color: theme.text }]}> {benefit} </Text>
                    </View>
                  ))}
                </View>
              </View>
              {/* Tips de uso */}
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Tips para mejores resultados</Text>
                {selectedBenefit.tips && selectedBenefit.tips.map((tip, index) => (
                  <View key={`tip-${index}`} style={styles.tipItem}>
                    <View style={[styles.tipNumber, { backgroundColor: selectedBenefit.color }]}> <Text style={styles.tipNumberText}>{index + 1}</Text> </View>
                    <Text style={[styles.tipText, { color: theme.textSecondary }]}> {tip} </Text>
                  </View>
                ))}
              </View>
              {/* CTA */}
              <TouchableOpacity
                style={[styles.modalCTA, { backgroundColor: selectedBenefit.color }]}
                onPress={() => {
                  closeBenefitsModal();
                  scrollToProducts();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCTAText}>Ver Productos</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  };

  const renderProduct = (product, index) => (
      <View key={product.id} style={[
        styles.productCard,
        {
          backgroundColor: theme.card,
          shadowColor: theme.shadow,
          borderColor: theme.border,
          borderWidth: isDark ? 1 : 0,
        }
      ]}>
        {/* Badge de stock bajo */}
        {product.stock <= 5 && product.stock > 0 && (
            <View style={styles.stockBadge}>
              <Text style={styles.stockBadgeText}>¡Solo quedan {product.stock}!</Text>
            </View>
        )}
        {/* Imagen del producto */}
        <View style={styles.productImageContainer}>
          {product.image_url ? (
              <Image
                  source={{ uri: product.image_url }}
                  style={styles.productImage}
                  resizeMode="cover"
              />
          ) : (
              <View style={[styles.productImagePlaceholder, { backgroundColor: theme.background }]}>
                <Ionicons name="water" size={60} color={COLORS.primary} />
              </View>
          )}
          {/* Botón de favorito */}
          <TouchableOpacity style={styles.favoriteBtn} activeOpacity={0.7}>
            <Ionicons name="heart-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        {/* Información del producto */}
        <View style={styles.productContent}>
          <Text style={[styles.productTitle, { color: theme.text }]} numberOfLines={2}>
            {product.title}
          </Text>
          {/* Rating */}
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1,2,3,4,5].map((star) => (
                  <Ionicons key={star} name="star" size={16} color={COLORS.accent} />
              ))}
            </View>
            <Text style={[styles.ratingText, { color: theme.textSecondary }]}>(4.8)</Text>
          </View>
          <Text style={[styles.productDescription, { color: theme.textSecondary }]} numberOfLines={3}>
            {product.description}
          </Text>
          {/* Precio y stock */}
          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: theme.text }]}>
                Bs{product.price}
              </Text>
              <Text style={[styles.stockText, {
                color: product.stock > 10 ? COLORS.success :
                    product.stock > 0 ? COLORS.warning : COLORS.error
              }]}>
                {product.stock > 10 ? 'Disponible' :
                    product.stock > 0 ? `Solo ${product.stock}` : 'Agotado'}
              </Text>
            </View>
            {/* Botón de agregar al carrito */}
            <TouchableOpacity
                style={[
                  styles.addButton,
                  {
                    backgroundColor: product.stock > 0 ? COLORS.secondary : theme.border,
                    opacity: product.stock > 0 ? 1 : 0.5
                  }
                ]}
                onPress={() => addToCart(product.id)}
                disabled={product.stock <= 0}
                activeOpacity={0.8}
            >
              <Ionicons
                  name={product.stock > 0 ? "add" : "close"}
                  size={24}
                  color="#FFF"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
  );

  return (
      <View style={{ flex: 1 }}>
        <ScrollView
            ref={scrollRef}
            style={[styles.container, { backgroundColor: theme.background }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
        >
          {/* Header simplificado */}
          <View style={[styles.header, { backgroundColor: theme.surface }]}>
            <View style={styles.logoSection}>
              <View style={[styles.logoIcon, { backgroundColor: COLORS.primary }]}>
                <Ionicons name="leaf" size={28} color="#FFF" />
              </View>
              <View>
                <Text style={[styles.logoText, { color: theme.text }]}>EcoStylo</Text>
                <Text style={[styles.logoSubtext, { color: theme.textSecondary }]}>Gel Capilar Natural</Text>
              </View>
            </View>
          </View>

          {/* Hero específico para gel capilar */}
          <View style={styles.heroSection}>
            <View style={[styles.heroCard, { backgroundColor: COLORS.primary }]}>
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>
                  Cabello{'\n'}
                  <Text style={{
                    color: COLORS.accent,
                    textShadowColor: '#FFFFFF',
                    textShadowOffset: { width: 1, height: 1 },
                    textShadowRadius: 0,
                  }}>
                    Saludable y Natural
                  </Text>
                </Text>
                <Text style={styles.heroSubtitle}>
                  Gel capilar con aloe vera 100% natural{'\n'}
                  para un cabello fuerte y brillante
                </Text>
                <TouchableOpacity
                    style={[styles.heroButton, { backgroundColor: COLORS.secondary }]}
                    activeOpacity={0.8}
                    onPress={scrollToProducts}
                >
                  <Text style={styles.heroButtonText}>VER PRODUCTOS</Text>
                  <Ionicons name="arrow-down" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
              {/* Stats específicos */}
              <View style={styles.heroStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>500+</Text>
                  <Text style={styles.statLabel}>Clientes</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>4.9★</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>100%</Text>
                  <Text style={styles.statLabel}>Aloe Vera</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Beneficios específicos para gel capilar - AHORA CON FUNCIONALIDAD */}
          <View style={styles.benefitsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Beneficios del Aloe Vera
            </Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.benefitsScroll}
            >
              {[
                { icon: 'water', title: 'Hidratación', desc: 'Cabello suave y sedoso', color: COLORS.primary },
                { icon: 'shield-checkmark', title: 'Protección', desc: 'Contra daño ambiental', color: COLORS.success },
                { icon: 'flash', title: 'Fortalece', desc: 'Desde la raíz', color: COLORS.secondary },
                { icon: 'sparkles', title: 'Brillo Natural', desc: 'Sin químicos agresivos', color: COLORS.accent },
              ].map((benefit, index) => (
                  <TouchableOpacity
                      key={index}
                      style={[
                        styles.benefitCard,
                        {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                          borderColor: benefit.color,
                          borderWidth: 2,
                        }
                      ]}
                      onPress={() => openBenefitsModal(benefit.title)}
                      activeOpacity={0.8}
                  >
                    <View style={[styles.benefitIcon, { backgroundColor: benefit.color }]}>
                      <Ionicons name={benefit.icon} size={28} color="#FFF" />
                    </View>
                    <Text style={[styles.benefitTitle, { color: theme.text }]}>
                      {benefit.title}
                    </Text>
                    <Text style={[styles.benefitDesc, { color: theme.textSecondary }]}>
                      {benefit.desc}
                    </Text>
                    <View style={styles.benefitTapHint}>
                      <Text style={[styles.benefitTapText, { color: benefit.color }]}>
                        Toca para más info
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color={benefit.color} />
                    </View>
                  </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Productos */}
          <View
              style={styles.productsSection}
              ref={productsSectionRef}
              onLayout={onProductsLayout}
          >
            <View style={styles.productsHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Nuestros Geles Capilares
              </Text>
              <View style={[styles.productsBadge, { backgroundColor: COLORS.primary }]}>
                <Text style={styles.productsBadgeText}>{products.length}</Text>
              </View>
            </View>
            {loading ? (
                <View style={styles.loadingState}>
                  <View style={[styles.loadingSpinner, { backgroundColor: COLORS.primary }]}>
                    <Ionicons name="refresh" size={32} color="#FFF" />
                  </View>
                  <Text style={[styles.loadingText, { color: theme.text }]}>
                    Cargando productos...
                  </Text>
                </View>
            ) : error ? (
                <View style={styles.errorState}>
                  <Ionicons name="alert-circle" size={60} color={COLORS.error} />
                  <Text style={[styles.errorText, { color: theme.text }]}>
                    Error al cargar productos
                  </Text>
                  <TouchableOpacity
                      style={[styles.retryBtn, { backgroundColor: COLORS.primary }]}
                      onPress={fetchProducts}
                      activeOpacity={0.8}
                  >
                    <Text style={styles.retryBtnText}>Reintentar</Text>
                  </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.productsContainer}>
                  {products.map(renderProduct)}
                </View>
            )}
          </View>

          {/* Testimonios específicos */}
          <View style={styles.testimonialsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Cabello Transformado
            </Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.testimonialsScroll}
            >
              {[
                { name: 'María G.', text: 'Mi cabello nunca se había visto tan saludable y brillante', avatar: '👩🏻' },
                { name: 'Ana R.', text: 'El aloe vera realmente funciona, cabello súper suave', avatar: '👩🏽' },
                { name: 'Carmen L.', text: 'Natural y efectivo, mi cabello está más fuerte', avatar: '👩🏻‍🦱' },
              ].map((testimonial, index) => (
                  <View key={index} style={[
                    styles.testimonialCard,
                    { backgroundColor: theme.surface, borderColor: theme.border }
                  ]}>
                    <View style={styles.testimonialHeader}>
                      <Text style={styles.avatar}>{testimonial.avatar}</Text>
                      <View>
                        <Text style={[styles.testimonialName, { color: theme.text }]}>
                          {testimonial.name}
                        </Text>
                        <View style={styles.testimonialStars}>
                          {[1,2,3,4,5].map((star) => (
                              <Ionicons key={star} name="star" size={14} color={COLORS.accent} />
                          ))}
                        </View>
                      </View>
                    </View>
                    <Text style={[styles.testimonialText, { color: theme.textSecondary }]}>
                      "{testimonial.text}"
                    </Text>
                  </View>
              ))}
            </ScrollView>
          </View>

          {/* Redes sociales mejoradas */}
          <View style={styles.socialSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Síguenos para tips de cuidado capilar
            </Text>
            <View style={styles.socialContainer}>
              <TouchableOpacity
                  style={[styles.socialButton, styles.instagramBtn]}
                  onPress={() => openSocialLink('https://www.instagram.com/GelNatAloeVera123')}
                  activeOpacity={0.8}
              >
                <Ionicons name="logo-instagram" size={20} color="#FFF" />
                <Text style={styles.socialText}>Instagram</Text>
                <Text style={styles.socialSubtext}>@GelNatAloeVera123</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={[styles.socialButton, styles.tiktokBtn]}
                  onPress={() => openSocialLink('https://www.tiktok.com/@grupoaloevera7')}
                  activeOpacity={0.8}
              >
                <Ionicons name="logo-tiktok" size={20} color="#FFF" />
                <Text style={styles.socialText}>TikTok</Text>
                <Text style={styles.socialSubtext}>@grupoaloevera7</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={[styles.socialButton, styles.facebookBtn]}
                  onPress={() => openSocialLink('https://www.facebook.com/share/1CXBfmbzVZ/?mibextid=wwXIfr')}
                  activeOpacity={0.8}
              >
                <Ionicons name="logo-facebook" size={20} color="#FFF" />
                <Text style={styles.socialText}>Facebook</Text>
                <Text style={styles.socialSubtext}>EcoStylo Oficial</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={[styles.socialButton, styles.linktreeBtn]}
                  onPress={() => openSocialLink('https://linktr.ee/TESLAQUINCE')}
                  activeOpacity={0.8}
              >
                <Ionicons name="link" size={20} color="#FFF" />
                <Text style={styles.socialText}>Más Enlaces</Text>
                <Text style={styles.socialSubtext}>Todos nuestros links</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* FAB del carrito */}
        {cartCount > 0 && (
            <TouchableOpacity
                style={[
                  styles.cartFab,
                  {
                    backgroundColor: COLORS.secondary,
                    shadowColor: COLORS.secondary,
                  }
                ]}
                onPress={() => navigation.navigate('Cart')}
                activeOpacity={0.8}
            >
              <Ionicons name="bag" size={28} color="#FFF" />
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            </TouchableOpacity>
        )}

        {/* Modal de beneficios */}
        {renderBenefitsModal()}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  // Header simplificado
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  logoSubtext: {
    fontSize: 12,
    marginTop: -2,
  },
  // Hero específico
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    minHeight: 280,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
    lineHeight: 42,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 24,
    lineHeight: 24,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignSelf: 'flex-start',
    minWidth: 200,
  },
  heroButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  // Beneficios
  benefitsSection: {
    paddingVertical: 20,
  },
  benefitsScroll: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  benefitCard: {
    width: 160,
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginRight: 16,
  },
  benefitIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  benefitDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 8,
  },
  benefitTapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  benefitTapText: {
    fontSize: 11,
    fontWeight: '600',
    marginRight: 4,
  },
  // Productos
  productsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  productsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  productsBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  productsContainer: {
    // Una sola columna
  },
  productCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  stockBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 1,
  },
  stockBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productImageContainer: {
    height: 200,
    position: 'relative',
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
  favoriteBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productContent: {
    padding: 20,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
  },
  productDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  // Estados
  loadingState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingSpinner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    marginVertical: 20,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  retryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Testimonios
  testimonialsSection: {
    paddingVertical: 20,
  },
  testimonialsScroll: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  testimonialCard: {
    width: 280,
    padding: 20,
    borderRadius: 16,
    marginRight: 16,
    borderWidth: 1,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 32,
    marginRight: 12,
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  testimonialStars: {
    flexDirection: 'row',
  },
  testimonialText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  // Redes sociales mejoradas
  socialSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  socialContainer: {
    marginTop: 16,
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  instagramBtn: {
    backgroundColor: '#E4405F',
  },
  tiktokBtn: {
    backgroundColor: '#000000',
  },
  facebookBtn: {
    backgroundColor: '#1877F2',
  },
  linktreeBtn: {
    backgroundColor: '#00C851',
  },
  socialText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
    flex: 1,
  },
  socialSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  // Títulos
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  // FAB
  cartFab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  cartBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: 'bold',
  },

  // ESTILOS DEL MODAL DE BENEFICIOS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: width * 0.95,
    maxWidth: 420,
    maxHeight: height * 0.85,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: 12,
    flexShrink: 0,
  },
  detailText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  benefitsGrid: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  benefitItemText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  tipNumberText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tipText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
    marginTop: 2,
  },
  modalCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginTop: 8,
    marginBottom: 20,
  },
  modalCTAText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default Home;
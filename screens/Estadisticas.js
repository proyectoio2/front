import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, useColorScheme, TouchableOpacity, LayoutAnimation, Platform, UIManager, Dimensions } from 'react-native';
import { apiFetch } from '../core/api';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Colores optimizados para dashboard
const COLORS = {
  primary: '#2E7D32',
  secondary: '#FF6B35',
  accent: '#4CAF50',
  success: '#66BB6A',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  light: {
    background: '#F8F9FA',
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

const Estadisticas = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [expandedWeeks, setExpandedWeeks] = useState([]);
  const [expandedDays, setExpandedDays] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, weekly, daily
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = COLORS[isDark ? 'dark' : 'light'];

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, ok } = await apiFetch('/store/reports/sales', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!ok) throw new Error(data?.detail || 'Error al obtener el reporte');
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleWeek = (week) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedWeeks(prev => prev.includes(week) ? prev.filter(w => w !== week) : [...prev, week]);
  };

  const toggleDay = (date) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedDays(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
  };

  // Calcular métricas generales
  const calculateMetrics = () => {
    if (!report) return { totalSales: 0, totalOrders: 0, totalProducts: 0, avgOrderValue: 0 };

    const totalSales = report.weekly_sales?.reduce((acc, w) => acc + w.total_sales, 0) || 0;
    const totalOrders = report.weekly_sales?.reduce((acc, w) => acc + w.total_orders, 0) || 0;
    const totalProducts = report.product_summary?.reduce((acc, p) => acc + p.units_sold, 0) || 0;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return { totalSales, totalOrders, totalProducts, avgOrderValue };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (timeString) => {
    return timeString.slice(0, 5); // HH:MM
  };

  const renderMetricCard = (title, value, icon, color, subtitle) => (
      <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.metricHeader}>
          <View style={[styles.metricIcon, { backgroundColor: color }]}>
            <Ionicons name={icon} size={24} color="#FFF" />
          </View>
          <Text style={[styles.metricTitle, { color: theme.textSecondary }]}>{title}</Text>
        </View>
        <Text style={[styles.metricValue, { color: theme.text }]}>{value}</Text>
        {subtitle && <Text style={[styles.metricSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
      </View>
  );

  const renderOrderCard = (order) => (
      <View key={order.order_id} style={[styles.orderCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={[styles.orderNumber, { color: COLORS.primary }]}>#{order.order_number}</Text>
            <Text style={[styles.customerName, { color: theme.text }]}>{order.customer_name}</Text>
          </View>
          <View style={styles.orderAmount}>
            <Text style={[styles.orderTotal, { color: COLORS.success }]}>Bs{order.total_amount}</Text>
            <Text style={[styles.orderTime, { color: theme.textSecondary }]}>{formatTime(order.purchase_time)}</Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.contactInfo}>
            <Ionicons name="mail" size={14} color={theme.textSecondary} />
            <Text style={[styles.contactText, { color: theme.textSecondary }]}>{order.customer_email}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Ionicons name="call" size={14} color={theme.textSecondary} />
            <Text style={[styles.contactText, { color: theme.textSecondary }]}>{order.customer_phone}</Text>
          </View>
        </View>

        <View style={styles.productsContainer}>
          {order.products.map(product => (
              <View key={product.product_id} style={styles.productRow}>
                <Text style={[styles.productName, { color: theme.text }]}>{product.title}</Text>
                <Text style={[styles.productQuantity, { color: theme.textSecondary }]}>x{product.quantity}</Text>
                <Text style={[styles.productSubtotal, { color: COLORS.primary }]}>Bs{product.subtotal}</Text>
              </View>
          ))}
        </View>
      </View>
  );

  const renderTabButton = (tabKey, title, icon) => (
      <TouchableOpacity
          style={[
            styles.tabButton,
            {
              backgroundColor: activeTab === tabKey ? COLORS.primary : 'transparent',
              borderColor: activeTab === tabKey ? COLORS.primary : theme.border,
            }
          ]}
          onPress={() => setActiveTab(tabKey)}
          activeOpacity={0.7}
      >
        <Ionicons
            name={icon}
            size={20}
            color={activeTab === tabKey ? '#FFF' : theme.textSecondary}
        />
        <Text style={[
          styles.tabButtonText,
          { color: activeTab === tabKey ? '#FFF' : theme.textSecondary }
        ]}>
          {title}
        </Text>
      </TouchableOpacity>
  );

  if (loading) {
    return (
        <View style={[styles.centered, { backgroundColor: theme.background }]}>
          <View style={[styles.loadingContainer, { backgroundColor: theme.card }]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingText, { color: theme.text }]}>Cargando estadísticas...</Text>
          </View>
        </View>
    );
  }

  if (error) {
    return (
        <View style={[styles.centered, { backgroundColor: theme.background }]}>
          <View style={[styles.errorContainer, { backgroundColor: theme.card }]}>
            <Ionicons name="alert-circle" size={60} color={COLORS.error} />
            <Text style={[styles.errorText, { color: theme.text }]}>{error}</Text>
            <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: COLORS.primary }]}
                onPress={fetchReport}
                activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        </View>
    );
  }

  if (!report) return null;

  const metrics = calculateMetrics();

  return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Dashboard de Ventas</Text>
          <TouchableOpacity onPress={fetchReport} activeOpacity={0.7}>
            <Ionicons name="refresh" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, { backgroundColor: theme.surface }]}>
          {renderTabButton('overview', 'Resumen', 'analytics')}
          {renderTabButton('weekly', 'Semanal', 'calendar')}
          {renderTabButton('daily', 'Diario', 'today')}
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {activeTab === 'overview' && (
              <View style={styles.overviewContainer}>
                {/* Métricas principales */}
                <View style={styles.metricsGrid}>
                  {renderMetricCard(
                      'Ventas Totales',
                      `Bs${metrics.totalSales}`,
                      'trending-up',
                      COLORS.success,
                      'Últimas semanas'
                  )}
                  {renderMetricCard(
                      'Pedidos',
                      metrics.totalOrders.toString(),
                      'receipt',
                      COLORS.info,
                      'Total de órdenes'
                  )}
                  {renderMetricCard(
                      'Productos Vendidos',
                      metrics.totalProducts.toString(),
                      'cube',
                      COLORS.warning,
                      'Unidades totales'
                  )}
                  {renderMetricCard(
                      'Promedio por Pedido',
                      `Bs${metrics.avgOrderValue.toFixed(0)}`,
                      'calculator',
                      COLORS.secondary,
                      'Valor promedio'
                  )}
                </View>

                {/* Productos más vendidos */}
                <View style={[styles.section, { backgroundColor: theme.card }]}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Productos Más Vendidos</Text>
                  {report.product_summary?.map(product => (
                      <View key={product.product_id} style={styles.productSummaryRow}>
                        <View style={styles.productSummaryInfo}>
                          <Text style={[styles.productSummaryName, { color: theme.text }]}>{product.title}</Text>
                          <Text style={[styles.productSummaryUnits, { color: theme.textSecondary }]}>
                            {product.units_sold} unidades vendidas
                          </Text>
                        </View>
                        <Text style={[styles.productSummaryTotal, { color: COLORS.success }]}>
                          Bs{product.total}
                        </Text>
                      </View>
                  ))}
                </View>
              </View>
          )}

          {activeTab === 'weekly' && (
              <View style={styles.weeklyContainer}>
                {report.weekly_sales?.filter(week => week.total_sales > 0).map((week, idx) => (
                    <View key={week.week || idx} style={[styles.periodCard, { backgroundColor: theme.card }]}>
                      <TouchableOpacity
                          onPress={() => toggleWeek(week.week)}
                          style={styles.periodHeader}
                          activeOpacity={0.8}
                      >
                        <View style={styles.periodInfo}>
                          <Text style={[styles.periodTitle, { color: theme.text }]}>Semana {week.week}</Text>
                          <Text style={[styles.periodSubtitle, { color: theme.textSecondary }]}>
                            {week.total_orders} pedidos
                          </Text>
                        </View>
                        <View style={styles.periodStats}>
                          <Text style={[styles.periodAmount, { color: COLORS.success }]}>Bs{week.total_sales}</Text>
                          <Ionicons
                              name={expandedWeeks.includes(week.week) ? 'chevron-up' : 'chevron-down'}
                              size={20}
                              color={theme.textSecondary}
                          />
                        </View>
                      </TouchableOpacity>

                      {expandedWeeks.includes(week.week) && (
                          <View style={styles.periodContent}>
                            {week.sales_details?.map(order => renderOrderCard(order))}
                          </View>
                      )}
                    </View>
                ))}
              </View>
          )}

          {activeTab === 'daily' && (
              <View style={styles.dailyContainer}>
                {report.daily_sales?.filter(day => day.total_sales > 0).map((day, idx) => (
                    <View key={day.date || idx} style={[styles.periodCard, { backgroundColor: theme.card }]}>
                      <TouchableOpacity
                          onPress={() => toggleDay(day.date)}
                          style={styles.periodHeader}
                          activeOpacity={0.8}
                      >
                        <View style={styles.periodInfo}>
                          <Text style={[styles.periodTitle, { color: theme.text }]}>{formatDate(day.date)}</Text>
                          <Text style={[styles.periodSubtitle, { color: theme.textSecondary }]}>
                            {day.total_orders} pedidos
                          </Text>
                        </View>
                        <View style={styles.periodStats}>
                          <Text style={[styles.periodAmount, { color: COLORS.success }]}>Bs{day.total_sales}</Text>
                          <Ionicons
                              name={expandedDays.includes(day.date) ? 'chevron-up' : 'chevron-down'}
                              size={20}
                              color={theme.textSecondary}
                          />
                        </View>
                      </TouchableOpacity>

                      {expandedDays.includes(day.date) && (
                          <View style={styles.periodContent}>
                            {day.sales_details?.map(order => renderOrderCard(order))}
                          </View>
                      )}
                    </View>
                ))}
              </View>
          )}
        </ScrollView>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    gap: 8,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Scroll container
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Overview
  overviewContainer: {
    paddingVertical: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  metricCard: {
    width: (width - 56) / 2,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 12,
  },

  // Section
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  // Product summary
  productSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  productSummaryInfo: {
    flex: 1,
  },
  productSummaryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productSummaryUnits: {
    fontSize: 14,
  },
  productSummaryTotal: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Period cards
  weeklyContainer: {
    paddingVertical: 20,
  },
  dailyContainer: {
    paddingVertical: 20,
  },
  periodCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  periodInfo: {
    flex: 1,
  },
  periodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  periodSubtitle: {
    fontSize: 14,
  },
  periodStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  periodAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  periodContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },

  // Order cards
  orderCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderAmount: {
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  orderTime: {
    fontSize: 12,
  },
  orderDetails: {
    marginBottom: 12,
    gap: 4,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 12,
  },
  productsContainer: {
    gap: 8,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  productQuantity: {
    fontSize: 14,
    marginHorizontal: 12,
  },
  productSubtotal: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Loading & Error states
  loadingContainer: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    fontSize: 16,
    marginVertical: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Estadisticas;
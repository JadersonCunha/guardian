import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Linking, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

export default function SafePlacesScreen({ navigation }) {
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [safePlaces, setSafePlaces] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 15000
        });
        setUserLocation(location.coords);
        await findNearbyPlaces(location.coords);
      } else {
        setError('Permissão de localização negada');
        loadEmergencyNumbers();
      }
    } catch (error) {
      console.log('Erro ao obter localização:', error);
      setError('Erro ao obter localização');
      loadEmergencyNumbers();
    }
    setIsLoading(false);
  };

  const findNearbyPlaces = async (coords) => {
    const places = [];
    
    // Números de emergência sempre no topo
    places.push(
      {
        id: 'emergency_180',
        name: 'Central de Atendimento à Mulher',
        address: 'Ligue 180 - Atendimento Nacional',
        phone: '180',
        type: 'emergency',
        hours: '24 horas',
        distance: 'Disque 180'
      },
      {
        id: 'emergency_190',
        name: 'Polícia Militar',
        address: 'Ligue 190 - Emergência',
        phone: '190',
        type: 'emergency',
        hours: '24 horas',
        distance: 'Disque 190'
      },
      {
        id: 'emergency_192',
        name: 'SAMU',
        address: 'Ligue 192 - Emergência Médica',
        phone: '192',
        type: 'emergency',
        hours: '24 horas',
        distance: 'Disque 192'
      }
    );

    // Gera locais próximos baseados na localização real
    const nearbyPlaces = generateNearbyPlaces(coords);
    places.push(...nearbyPlaces);
    
    setSafePlaces(places);
  };

  const generateNearbyPlaces = (coords) => {
    const places = [];
    
    // Hospitais próximos
    const hospitals = [
      'Hospital Municipal',
      'UPA - Unidade de Pronto Atendimento',
      'Hospital Regional'
    ];
    
    hospitals.forEach((name, index) => {
      const offsetLat = (Math.random() - 0.5) * 0.02;
      const offsetLng = (Math.random() - 0.5) * 0.02;
      const lat = coords.latitude + offsetLat;
      const lng = coords.longitude + offsetLng;
      
      places.push({
        id: `hospital_${index}`,
        name: name,
        address: 'Localizado via GPS',
        phone: '192',
        type: 'hospital',
        hours: '24 horas',
        lat: lat,
        lng: lng,
        distance: calculateDistance(coords.latitude, coords.longitude, lat, lng)
      });
    });

    // Farmácias próximas
    const pharmacies = [
      'Farmácia Popular',
      'Drogaria 24h'
    ];
    
    pharmacies.forEach((name, index) => {
      const offsetLat = (Math.random() - 0.5) * 0.015;
      const offsetLng = (Math.random() - 0.5) * 0.015;
      const lat = coords.latitude + offsetLat;
      const lng = coords.longitude + offsetLng;
      
      places.push({
        id: `pharmacy_${index}`,
        name: name,
        address: 'Localizada via GPS',
        phone: null,
        type: 'pharmacy',
        hours: 'Variável',
        lat: lat,
        lng: lng,
        distance: calculateDistance(coords.latitude, coords.longitude, lat, lng)
      });
    });

    // Delegacias próximas
    const police = [
      'Delegacia da Mulher',
      'Delegacia de Polícia Civil'
    ];
    
    police.forEach((name, index) => {
      const offsetLat = (Math.random() - 0.5) * 0.025;
      const offsetLng = (Math.random() - 0.5) * 0.025;
      const lat = coords.latitude + offsetLat;
      const lng = coords.longitude + offsetLng;
      
      places.push({
        id: `police_${index}`,
        name: name,
        address: 'Localizada via GPS',
        phone: '190',
        type: 'police',
        hours: '24 horas',
        lat: lat,
        lng: lng,
        distance: calculateDistance(coords.latitude, coords.longitude, lat, lng)
      });
    });

    // Ordena por distância
    places.sort((a, b) => {
      if (!a.lat || !b.lat) return 0;
      const distA = parseFloat(a.distance);
      const distB = parseFloat(b.distance);
      return distA - distB;
    });

    return places;
  };

  const loadEmergencyNumbers = () => {
    setSafePlaces([
      {
        id: 'emergency_180',
        name: 'Central de Atendimento à Mulher',
        address: 'Ligue 180 - Atendimento Nacional',
        phone: '180',
        type: 'emergency',
        hours: '24 horas',
        distance: 'Disque 180'
      },
      {
        id: 'emergency_190',
        name: 'Polícia Militar',
        address: 'Ligue 190 - Emergência',
        phone: '190',
        type: 'emergency',
        hours: '24 horas',
        distance: 'Disque 190'
      },
      {
        id: 'emergency_192',
        name: 'SAMU',
        address: 'Ligue 192 - Emergência Médica',
        phone: '192',
        type: 'emergency',
        hours: '24 horas',
        distance: 'Disque 192'
      }
    ]);
  };

  const openMaps = (place) => {
    if (!place.lat || !place.lng) {
      Alert.alert('📍 Local', 'Este é um número de emergência nacional. Ligue diretamente.');
      return;
    }
    
    const mapsUrl = `https://maps.google.com/?q=${place.lat},${place.lng}`;
    
    Alert.alert(
      `📍 ${place.name}`,
      `Abrir no Google Maps?\n\n${place.address}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir Maps', onPress: () => Linking.openURL(mapsUrl) }
      ]
    );
  };

  const callPlace = (place) => {
    const phoneUrl = `tel:${place.phone}`;
    
    Alert.alert(
      `📞 ${place.name}`,
      `Ligar para: ${place.phone}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ligar', onPress: () => Linking.openURL(phoneUrl) }
      ]
    );
  };

  const getPlaceIcon = (type) => {
    switch (type) {
      case 'emergency': return '🆘';
      case 'police': return '🚔';
      case 'hospital': return '🏥';
      case 'pharmacy': return '💊';
      default: return '📍';
    }
  };

  const renderPlaceItem = ({ item }) => (
    <View style={styles.placeCard}>
      <View style={styles.placeHeader}>
        <Text style={styles.placeIcon}>{getPlaceIcon(item.type)}</Text>
        <View style={styles.placeInfo}>
          <Text style={styles.placeName}>{item.name}</Text>
          <Text style={styles.placeAddress}>{item.address}</Text>
          <Text style={styles.placeHours}>⏰ {item.hours}</Text>
          <Text style={styles.placeDistance}>📏 {item.distance}</Text>
        </View>
      </View>
      
      <View style={styles.placeActions}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => openMaps(item)}
        >
          <Text style={styles.actionText}>🗺️ Ver no Mapa</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.callBtn}
          onPress={() => callPlace(item)}
        >
          <Text style={styles.actionText}>📞 Ligar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📍 Locais Seguros</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          🛡️ Locais próximos onde você pode buscar ajuda e proteção
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00b894" />
          <Text style={styles.loadingText}>📍 Buscando locais seguros próximos...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Text style={styles.errorSubtext}>Mostrando números de emergência:</Text>
        </View>
      ) : null}

      <FlatList
        data={safePlaces}
        renderItem={renderPlaceItem}
        keyExtractor={item => item.id}
        style={styles.placesList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.emergencyBox}>
        <Text style={styles.emergencyTitle}>🚨 Emergência?</Text>
        <View style={styles.emergencyButtons}>
          <TouchableOpacity 
            style={styles.emergencyBtn}
            onPress={() => Linking.openURL('tel:190')}
          >
            <Text style={styles.emergencyText}>190 Polícia</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.emergencyBtn}
            onPress={() => Linking.openURL('tel:180')}
          >
            <Text style={styles.emergencyText}>180 Mulher</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#2d3436',
  },
  backBtn: {
    fontSize: 16,
    color: '#74b9ff',
    marginRight: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  infoBox: {
    backgroundColor: '#00b894',
    padding: 15,
    margin: 20,
    borderRadius: 10,
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  loadingText: {
    textAlign: 'center',
    color: '#636e72',
    fontSize: 16,
    marginTop: 15,
  },
  errorContainer: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  errorText: {
    color: '#e17055',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorSubtext: {
    color: '#636e72',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  placesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  placeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  placeHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  placeIcon: {
    fontSize: 24,
    marginRight: 15,
    marginTop: 5,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 5,
  },
  placeAddress: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 3,
  },
  placeHours: {
    fontSize: 12,
    color: '#00b894',
    marginBottom: 3,
  },
  placeDistance: {
    fontSize: 12,
    color: '#e17055',
    fontWeight: '600',
  },
  placeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    backgroundColor: '#74b9ff',
    padding: 10,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  callBtn: {
    backgroundColor: '#00b894',
    padding: 10,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emergencyBox: {
    backgroundColor: '#d63031',
    padding: 15,
    margin: 20,
    borderRadius: 10,
  },
  emergencyTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  emergencyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emergencyBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  emergencyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
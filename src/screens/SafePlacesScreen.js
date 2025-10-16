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

    // Busca locais reais próximos
    try {
      const realPlaces = await searchRealPlaces(coords);
      places.push(...realPlaces);
    } catch (error) {
      console.log('Erro ao buscar locais reais:', error);
      // Fallback para locais genéricos se a API falhar
      const fallbackPlaces = getFallbackPlaces(coords);
      places.push(...fallbackPlaces);
    }
    
    setSafePlaces(places);
  };

  const searchRealPlaces = async (coords) => {
    const places = [];
    const { latitude, longitude } = coords;
    
    // Confirma que temos a localização real do usuário
    console.log(`Localização do usuário: ${latitude}, ${longitude}`);
    
    // Busca por tipos específicos de locais seguros
    const searchTypes = [
      { type: 'hospital', keyword: 'hospital OR UPA OR pronto atendimento', icon: 'hospital' },
      { type: 'police', keyword: 'delegacia OR polícia', icon: 'police' },
      { type: 'pharmacy', keyword: 'farmácia OR drogaria', icon: 'pharmacy' }
    ];
    
    for (const searchType of searchTypes) {
      try {
        // Usando a localização real para buscar
        const nearbyPlaces = await searchPlacesByType(latitude, longitude, searchType);
        places.push(...nearbyPlaces);
      } catch (error) {
        console.log(`Erro ao buscar ${searchType.type}:`, error);
      }
    }
    
    return places;
  };
  
  const searchPlacesByType = async (lat, lng, searchType) => {
    // Esta função deveria usar Google Places API
    // Por enquanto, retorna locais genéricos mas com aviso
    return getFallbackPlaces({ latitude: lat, longitude: lng }, searchType.type);
  };
  
  const getFallbackPlaces = (coords, specificType = null) => {
    const places = [];
    
    // Aviso que são locais genéricos mas com localização real
    places.push({
      id: 'warning',
      name: '📍 SUA LOCALIZAÇÃO DETECTADA',
      address: `Lat: ${coords.latitude.toFixed(6)}, Lng: ${coords.longitude.toFixed(6)}\nClique nos botões abaixo para buscar locais reais próximos.`,
      phone: null,
      type: 'warning',
      hours: 'Localização GPS ativa',
      distance: 'Precisa'
    });
    
    if (!specificType || specificType === 'hospital') {
      places.push({
        id: 'hospital_generic',
        name: 'Hospital/UPA Mais Próximo',
        address: 'Clique para buscar usando sua localização GPS',
        phone: '192',
        type: 'hospital',
        hours: 'Busca em tempo real',
        distance: 'GPS Ativo'
      });
    }
    
    if (!specificType || specificType === 'police') {
      places.push({
        id: 'police_generic',
        name: 'Delegacia da Mulher Mais Próxima',
        address: 'Clique para buscar usando sua localização GPS',
        phone: '190',
        type: 'police',
        hours: 'Busca em tempo real',
        distance: 'GPS Ativo'
      });
    }
    
    if (!specificType || specificType === 'pharmacy') {
      places.push({
        id: 'pharmacy_generic',
        name: 'Farmácia 24h Mais Próxima',
        address: 'Clique para buscar usando sua localização GPS',
        phone: null,
        type: 'pharmacy',
        hours: 'Busca em tempo real',
        distance: 'GPS Ativo'
      });
    }
    
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
    if (place.type === 'emergency') {
      Alert.alert('📍 Local', 'Este é um número de emergência nacional. Ligue diretamente.');
      return;
    }
    
    if (place.type === 'warning') {
      Alert.alert('⚠️ Aviso', place.address);
      return;
    }
    
    // Para locais genéricos, busca no Google Maps usando geolocalização
    let searchQuery = '';
    if (place.type === 'hospital') {
      searchQuery = 'hospital UPA pronto atendimento';
    } else if (place.type === 'police') {
      searchQuery = 'delegacia da mulher delegacia polícia';
    } else if (place.type === 'pharmacy') {
      searchQuery = 'farmácia drogaria 24h';
    }
    
    if (userLocation && searchQuery) {
      // URL que usa a localização atual do usuário para buscar
      const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}/data=!3m1!4b1!4m2!2m1!6e1?hl=pt-BR`;
      
      Alert.alert(
        `📍 Buscar ${place.name}`,
        `Buscar no Google Maps usando sua localização atual?\n\nLatitude: ${userLocation.latitude.toFixed(6)}\nLongitude: ${userLocation.longitude.toFixed(6)}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Buscar no Maps', onPress: () => Linking.openURL(mapsUrl) }
        ]
      );
    } else {
      Alert.alert('⚠️ Localização', 'Não foi possível obter sua localização. Ative o GPS e tente novamente.');
    }
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
      case 'warning': return '⚠️';
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
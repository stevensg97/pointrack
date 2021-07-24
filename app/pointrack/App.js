import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import getPunto from './src/pruebas'

export default function App() {
  return (
    <View style={styles.container}>
      <MapView style={styles.map}
        initialRegion={
          {
            latitude: getPunto()[0].latlng.latitude,
            longitude: getPunto()[0].latlng.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }
        }>
        {getPunto().map((item, index) => (
          <Marker
            key={index}
            
            pinColor={'green'}
            coordinate={item.latlng}
            title={item.nombre}
            description={item.description}
          >

          </Marker>

        ))}

      </MapView>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

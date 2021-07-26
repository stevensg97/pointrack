import React, { Component } from 'react';
import {
  Box,
  Center,
  Fab,
  Icon,
  Image,
  Text,
  Stagger,
  IconButton
} from 'native-base';
import { StyleSheet, Dimensions } from 'react-native';
import {
  SCREENS,
  ALERTS,
  BUTTONS,
  TITLES,
  MAP_DATA
} from '../../config/constants';
import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Location from 'expo-location';
import MapView, { Marker, Polyline, Callout } from 'react-native-maps';
import haversine from 'haversine'
import { useNavigation } from '@react-navigation/native';
import { useIsDrawerOpen } from '@react-navigation/drawer';
import LogoMarker from '../../assets/logoMarker.png';
import { colors } from '../../config/styles'

class HomeTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      location: null,
      errorMsg: null,
      autoMarkers: [],
      autoMarkersCordinates: [],
      selectedMarkers: [],
      selectedMarkersCordinates: [],
      tracking: false,
      distanceTravelled: 0,
      region: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0,
      },

    };
  }

  componentDidMount = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      this.setState({ errorMsg: 'Permission to access location was denied' });
      return;
    }
    let location = await Location.getCurrentPositionAsync({ accuracy: 6 });
    this.setState({ location: location });
    this.setState({
      region: {
        latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: MAP_DATA.LATITUDE_DELTA,
        longitudeDelta: MAP_DATA.LONGITUDE_DELTA,
      }
    });
  };

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  _addAutoMarker = async () => {
    let location = await Location.getCurrentPositionAsync({ accuracy: 6 });
    let marker = this.state.autoMarkers;
    const coordinates = { latitude: location.coords.latitude, longitude: location.coords.longitude }
    marker.push(
      {
        nombre: 'auto' + String(this.state.autoMarkers.length),
        latlng: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        },
        descripcion: 'Descripción',
        observaciones: 'Observación',
        hora: location.timestamp
      }
    );
    this.setState(prevState => ({
      autoMarkers: marker,
      autoMarkersCordinates: [...prevState.autoMarkersCordinates, coordinates]
    }));
    const len = this.state.autoMarkersCordinates.length;
    if (len > 1) {
      let totalDistance = 0;
      for (let i = 0; i < len - 1; i++) {
        totalDistance = totalDistance + this.calcDistance(this.state.autoMarkersCordinates[i], this.state.autoMarkersCordinates[i + 1]);

      }
      this.setState({ distanceTravelled: totalDistance });
    }

    console.log('Added auto marker: ', marker[marker.length - 1].nombre, coordinates)
  }

  _addSelectedMarker = () => {
    let marker = this.state.selectedMarkers;
    const coordinates = { latitude: this.state.region.latitude, longitude: this.state.region.longitude }
    marker.push(
      {
        nombre: 'selected' + String(this.state.selectedMarkers.length),
        latlng: { latitude: this.state.region.latitude, longitude: this.state.region.longitude },
        descripcion: 'Descripción',
        observaciones: 'Observación',
        hora: 'hora'
      }
    );
    this.setState(prevState => ({
      selectedMarkers: marker,
      selectedMarkersCordinates: [...prevState.selectedMarkersCordinates, coordinates]
    }));
    console.log('Added selected marker: ', marker[marker.length - 1].nombre)
  }

  calcDistance = (newLatLng, prevLatLng) => {
    return haversine(prevLatLng, newLatLng) || 0;
  };

  _onRegionChange = (region) => {
    this.setState({ region });
  }

  _startTracking = async () => {
    this.setState({ tracking: true });
    this._addAutoMarker();
    this.interval = setInterval(() => this._addAutoMarker(), 5000);
    console.log('Traking: On')
  }

  _stopTracking = () => {
    clearInterval(this.interval);
    this.setState({ tracking: false });
    console.log('Traking: Off')
  }



  render() {
    const { navigation } = this.props;
    const { isDrawerOpen } = this.props;

    return (
      <Box flex={1} bg='primary.500'>
        {this.state.location != null &&
          <Box flex={1}>
            {!isDrawerOpen && this.props.index == 0 &&
              <Box>
                <Fab
                  position="absolute"
                  placement='bottom-left'
                  mb={20}
                  bg='gradient_primary'
                  icon={<Icon color="black" as={<MaterialCommunityIcons name="plus" />} size="sm" />}
                  label={
                    <Text color="black" fontSize="sm">
                      Punto
                    </Text>
                  }
                  onPress={this._addSelectedMarker}
                />
                <Fab
                  position="absolute"
                  placement='bottom-right'
                  bg='gradient_secondary'
                  mb={20}
                  icon={<Icon color="black" as={<MaterialCommunityIcons name={this.state.tracking ? 'pause' : 'play'} />} size="sm" />}
                  label={
                    <Text color="black" fontSize="sm">
                      Tracking
                    </Text>
                  }
                  onPress={this.state.tracking ? this._stopTracking : this._startTracking}
                />
              </Box>
            }
            <Box flex={1}>
              <MapView style={styles.map}
                loadingEnabled={true}
                loadingIndicatorColor="#80acff"
                loadingBackgroundColor="#374151"
                moveOnMarkerPress={false}
                showsUserLocation={true}
                showsCompass={true}
                provider="google"
                initialRegion={this.state.region}
                onRegionChangeComplete={this._onRegionChange}
              >
                {this.state.autoMarkers.map((item, index) => (
                  <Marker
                    key={index}
                    pinColor={'green'}
                    coordinate={item.latlng}
                  >
                    <Callout>
                      <Box w={200} h={100} >
                        <Text fontSize='sm'>Nombre: {item.nombre}</Text>
                        <Text fontSize='sm'>Descripción:{item.descripcion}</Text>
                        <Text fontSize='sm'>Observación:{item.observaciones}</Text>
                        <Text fontSize='sm'>Hora:{item.hora}</Text>
                      </Box>
                    </Callout>
                  </Marker>
                ))}
                {this.state.selectedMarkers.map((item, index) => (
                  <Marker
                    key={index}
                    pinColor={'blue'}
                    coordinate={item.latlng}
                  >
                    <Callout>
                      <Box w={200} h={100} >
                        <Text fontSize='sm'>Nombre: {item.nombre}</Text>
                        <Text fontSize='sm'>Descripción:{item.descripcion}</Text>
                        <Text fontSize='sm'>Observación:{item.observaciones}</Text>
                        <Text fontSize='sm'>Hora:{item.hora}</Text>
                      </Box>
                    </Callout>
                  </Marker>
                ))}
                {this.state.selectedMarkersCordinates != [] &&
                  <Polyline
                    coordinates={this.state.selectedMarkersCordinates}
                    strokeColor={colors.primary[500]} // fallback for when `strokeColors` is not supported by the map-provider
                    strokeWidth={6}
                    lineDashPattern={[1]}
                    lineCap='round'
                  />
                }

              </MapView>
              <Box left='50%' ml={-5} mt={-39} bg='transparent' position='absolute' top='50%'>
                <Image source={LogoMarker} h={10} w={10} alt='fake-marker' />
              </Box>
            </Box>

            <Box bg='transparent' position='absolute'>
              <Text bold>Latitud: {this.state.region.latitude}</Text>
              <Text bold>Longitud: {this.state.region.longitude}</Text>
              <Text bold>Distancia: {parseFloat(this.state.distanceTravelled).toFixed(5)}km</Text>
            </Box>
          </Box>
        }


      </Box>
    );
  }
}

const styles = StyleSheet.create({
  map: {
    flex: 1
  },
});

export default function (props) {
  const navigation = useNavigation();
  const isDrawerOpen = useIsDrawerOpen();

  return <HomeTab {...props} navigation={navigation} isDrawerOpen={isDrawerOpen} />;
}

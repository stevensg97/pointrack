import React, { Component } from 'react';
import {
  Box,
  Center,
  Fab,
  Icon,
  Image,
  Text
} from 'native-base';
import { StyleSheet, Dimensions } from 'react-native';
import {
  SCREENS,
  ALERTS,
  BUTTONS,
  TITLES,
} from '../../config/constants';
import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import getPunto from '../../pruebas'
import LogoMarker from '../../assets/icon.png';

class HomeTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      location: null,
      errorMsg: null,
      autoMarkers: [],
      selectedMarkers: [],
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
    let location = await Location.getCurrentPositionAsync();
    this.setState({ location: location });
    this.setState({
      region: {
        latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.0306097200809905,
        longitudeDelta: 0.016958601772799398,
      }
    });

  };

  _addAutoMarker = async () => {
    let location = await Location.getCurrentPositionAsync({ accuracy: 6 });
    let marker = this.state.autoMarkers;
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
    this.setState({
      autoMarkers: marker
    });
  }

  _addSelectedMarker = () => {
    let marker = this.state.selectedMarkers;
    marker.push(
      {
        nombre: 'selected' + String(this.state.selectedMarkers.length),
        latlng: {latitude: this.state.region.latitude, longitude: this.state.region.longitude},
        descripcion: 'Descripción',
        observaciones: 'Observación',
        hora: 'hora'
      }
    );
    this.setState({
      selectedMarkers: marker
    });
  }

  _onRegionChange = (region) => {
    this.setState({ region });
  }



  render() {
    const { navigation } = this.props;

    return (
      <Box flex={1} bg='primary.500'>

        {this.state.location != null &&
          <Box flex={1}>
            <Fab
              position="absolute"
              placement='bottom-right'
              bg='gradient_secondary'
              mb={20}
              icon={<Icon color="black" as={<MaterialCommunityIcons name="plus" />} size="sm" />}
              onPress={this._addAutoMarker}
            />
            <Fab
              position="absolute"
              placement='bottom-left'
              mb={20}
              bg='gradient_primary'
              
              icon={<Icon color="white" as={<MaterialCommunityIcons name="plus" />} size="sm" />}
              onPress={this._addSelectedMarker}
            />
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
                    title={item.nombre}
                    description={item.descripcion + '\n' + item.observacion + '\n' + item.hora}
                  />

                ))}
                {this.state.selectedMarkers.map((item, index) => (
                  <Marker
                    key={index}

                    pinColor={'blue'}
                    coordinate={item.latlng}
                    title={item.nombre}
                    description={item.descripcion + '\n' + item.observacion + '\n' + item.hora}
                  />

                ))}
              </MapView>
              <Box left='50%' ml={-5} mt={-39} bg='transparent' position='absolute' top='50%'>
                <Image source={LogoMarker} h={10} w={10} alt='fake-marker' />
              </Box>
            </Box>

            <Box bg='transparent' position='absolute'>
              <Text bold>Latitud: {this.state.region.latitude}</Text>
              <Text bold>Longitud: {this.state.region.longitude}</Text>
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

  return <HomeTab {...props} navigation={navigation} />;
}

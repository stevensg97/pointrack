import React, { Component } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Box, Image } from 'native-base';
import MapView, { Marker } from 'react-native-maps';
import getPunto from '../../pruebas'
import LogoMarker from '../../assets/logoMarker.png';

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      region: {
        latitude: this.props.initLat,//10.261419522942488,
        longitude: this.props.initLong,//-85.58442480512633,
        latitudeDelta: 0.0306097200809905,
        longitudeDelta: 0.016958601772799398,
      },
    };
  }

  _onRegionChange = (region) => {
    this.setState({ region });
    this.props.onChange({latlng:{latitude: this.state.region.latitude, longitude: this.state.region.longitude}});
  }

  //handleChange = e => this.setState({ [e.target.name]: e.target.value });

  render() {
    return (
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
          {this.props.autoMarkers.map((item, index) => (
            <Marker
              key={index}

              pinColor={'green'}
              coordinate={item.latlng}
              title={item.nombre}
              description={item.descripcion + '\n' + item.observacion + '\n' + item.hora}
            />

          ))}
          {this.props.selectedMarkers.map((item, index) => (
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
            <Image source={LogoMarker} h={10} w={10}  alt='fake-marker' />
        </Box>
      </Box>

    );
  }

}

const styles = StyleSheet.create({
  map: {
    flex: 1
  },
});

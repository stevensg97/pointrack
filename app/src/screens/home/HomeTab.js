import React, { Component } from 'react';
import {
  Box,
  Center,
  Fab,
  Icon,
  Image,
  Text,
  Heading,
  Select,
  CheckIcon,
  VStack,
  Divider,
  Input,
  HStack,
  Modal,
  Button,
  KeyboardAvoidingView
} from 'native-base';
import { StyleSheet, Dimensions } from 'react-native';
import {
  SCREENS,
  ALERTS,
  BUTTONS,
  TITLES,
  MAP_DATA,
  PLACEHOLDERS,
  ICONS
} from '../../config/constants';
import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Location from 'expo-location';
import MapView, { Marker, Polyline, Callout } from 'react-native-maps';
import haversine from 'haversine'
import { useNavigation } from '@react-navigation/native';
import { useIsDrawerOpen } from '@react-navigation/drawer';
import LogoMarker from '../../assets/logoMarker.png';
import { colors } from '../../config/styles';

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
      showSelectMarkerModal: false,
      markerOnEditing: {
        name: '',
        latlng: {
          latitude: 0,
          longitude: 0
        },
        altitude: -1,
        description: [],
        observations: '',
        timestamp: 0
      },
      tracking: false,
      distanceTravelled: 0,
      region: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0,
      },
      mapType: MAP_DATA.MAP_TYPES.STANDARD.VALUE,

    };
    this.blankMarker = {
        name: '',
        latlng: {
          latitude: 0,
          longitude: 0
        },
        altitude: -1,
        description: [],
        observations: '',
        timestamp: 0
      }
  }

  componentDidMount = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      this.setState({ errorMsg: ALERTS.LOCATION_PERMISSION_DENIED });
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
    clearInterval(this.trackingInterval);
  }

  _addAutoMarker = async () => {
    let location = await Location.getCurrentPositionAsync({ accuracy: 6 });
    let markers = this.state.autoMarkers;
    const coordinates = { latitude: location.coords.latitude, longitude: location.coords.longitude }
    markers.push(
      {
        name: 'auto' + String(this.state.autoMarkers.length),
        latlng: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        },
        altitude: location.coords.altitude,
        timestamp: location.timestamp
      }
    );
    this.setState(prevState => ({
      autoMarkers: markers,
      autoMarkersCordinates: [...prevState.autoMarkersCordinates, coordinates]
    }));
    const len = this.state.autoMarkersCordinates.length;
    if (len > 1) {
      let totalDistance = 0;
      for (let i = 0; i < len - 1; i++) {
        totalDistance = totalDistance +
          this._calcDistance(this.state.autoMarkersCordinates[i], this.state.autoMarkersCordinates[i + 1]);

      }
      this.setState({ distanceTravelled: totalDistance });
    }
  }

  _addSelectedMarker = async () => {
    let markers = this.state.selectedMarkers;
    markers.push(
      {
        name: 'selected' + String(this.state.selectedMarkers.length),
        latlng: { latitude: this.state.region.latitude, longitude: this.state.region.longitude },
        altitude: -1,
        description: [],
        observations: '',
        timestamp: 0
      }
    );
    this.setState({
      selectedMarkers: markers,
      markerOnEditing: markers[markers.length - 1],
      showSelectMarkerModal: true,
    });
    this._calcSelectMarkerAltitude(this.state.selectedMarkers.length - 1)
  }

  _calcSelectMarkerAltitude = (index) => {
    if (this.state.autoMarkers.length == 1) {
      let selectedMarkers = [...this.state.selectedMarkers];
      let marker = { ...selectedMarkers[index] };
      marker.altitude = this.state.autoMarkers[0].altitude;
      selectedMarkers[index] = marker;
      this.setState({ selectedMarkers: selectedMarkers })
    }
    if (this.state.autoMarkers.length > 1) {
      let autoMarkerIndex = 0;
      let deltaLat = this.state.selectedMarkers[index].latlng.latitude - this.state.autoMarkers[autoMarkerIndex].latlng.latitude;
      let deltaLng = this.state.selectedMarkers[index].latlng.longitude - this.state.autoMarkers[autoMarkerIndex].latlng.longitude;
      for (let i = 1; i < this.state.autoMarkers.length; i++) {
        let newDeltaLat = this.state.selectedMarkers[index].latlng.latitude - this.state.autoMarkers[i].latlng.latitude;
        let newDeltaLng = this.state.selectedMarkers[index].latlng.longitude - this.state.autoMarkers[i].latlng.longitude;
        if (Math.abs(deltaLat) > Math.abs(newDeltaLat) && Math.abs(deltaLng) > Math.abs(newDeltaLng)) {
          deltaLat = newDeltaLat;
          deltaLng = newDeltaLng;
          autoMarkerIndex = i;
        }
      }
      let selectedMarkers = [...this.state.selectedMarkers];
      let marker = { ...selectedMarkers[index] };
      marker.altitude = this.state.autoMarkers[autoMarkerIndex].altitude;
      selectedMarkers[index] = marker;
      this.setState({ selectedMarkers: selectedMarkers })
    }
  };

  _calcDistance = (newLatLng, prevLatLng) => {
    return haversine(prevLatLng, newLatLng) || 0;
  };

  _deleteSelectedMarker = (markerName) => {
    let markers = Array.from(this.state.selectedMarkers);
    let markerIndex = -1;
    for (let i = 0; i < this.state.selectedMarkers.length; i++) {
      if (this.state.selectedMarkers[i].name == markerName) {
        markerIndex = i;
        break;
      }
    }
    if (markerIndex !== -1) {
      markers.splice(markerIndex, 1);
      this.setState({ selectedMarkers: markers, markerOnEditing: this.blankMarker, showSelectMarkerModal: false, })
    }
  }

  _updateSelectedMarker = (marker) => {
    let markers = Array.from(this.state.selectedMarkers);
    let markerIndex = -1;
    for (let i = 0; i < this.state.selectedMarkers.length; i++) {
      if (this.state.selectedMarkers[i].name == marker.name) {
        markerIndex = i;
        break;
      }
    }
    if (markerIndex !== -1) {
      markers[markerIndex] = marker;
      this.setState({ selectedMarkers: markers, markerOnEditing: this.blankMarker, showSelectMarkerModal: false, })
    }
  }

  _onEditMarkerModalTextChangedName = event => {
    let marker = this.state.markerOnEditing;
    marker.name = event.nativeEvent.text;
    this.setState({
      markerOnEditing: marker
    });
  };

  _onEditMarkerModalTextChangedLatitude = event => {
    let marker = JSON.parse(JSON.stringify(this.state.markerOnEditing));
    marker.latlng.latitude = Number(event.nativeEvent.text);
    this.setState({
      markerOnEditing: marker
    });
  };

  _onEditMarkerModalTextChangedLongitude = event => {
    let marker = JSON.parse(JSON.stringify(this.state.markerOnEditing));;
    marker.latlng.longitude = Number(event.nativeEvent.text);
    this.setState({
      markerOnEditing: marker
    });
  };

  _onEditMarkerModalTextChangedAltitude = event => {
    let marker = JSON.parse(JSON.stringify(this.state.markerOnEditing));;
    marker.altitude = Number(event.nativeEvent.text);
    this.setState({
      markerOnEditing: marker
    });
  };

  _onEditMarkerModalTextChangedObservations = event => {
    let marker = JSON.parse(JSON.stringify(this.state.markerOnEditing));;
    marker.observations = event.nativeEvent.text;
    this.setState({
      markerOnEditing: marker
    });
  };

  _onEditMarkerModalTextChangedTimestamp = event => {
    let marker = JSON.parse(JSON.stringify(this.state.markerOnEditing));;
    marker.timestamp = Number(event.nativeEvent.text);
    this.setState({
      markerOnEditing: marker
    });
  };

  _onRegionChangeComplete = (region) => {
    this.setState({ region });
  }

  _resetMarkers = () => {
    clearInterval(this.trackingInterval);
    this.setState({
      autoMarkers: [],
      autoMarkersCordinates: [],
      selectedMarkers: [],
      selectedMarkersCordinates: [],
      tracking: false,
      distanceTravelled: 0,
    });
  }

  _startTracking = async () => {
    this.setState({ tracking: true });
    this._addAutoMarker();
    this.trackingInterval = setInterval(() => this._addAutoMarker(), 5000);
  }

  _stopTracking = () => {
    clearInterval(this.trackingInterval);
    this.setState({ tracking: false });
  }



  render() {
    const { navigation } = this.props;
    const { isDrawerOpen } = this.props;

    return (
      <KeyboardAvoidingView flex={1}>
        <Box flex={1} bg='primary.500'>
          <Select
            minWidth={200}
            position='relative'
            accessibilityLabel={PLACEHOLDERS.MAPVIEW_TYPE}
            placeholder={PLACEHOLDERS.MAPVIEW_TYPE}
            color='white'
            placeholderTextColor='white'
            onValueChange={(itemValue) => this.setState({ mapType: itemValue })}
            _selectedItem={{
              bg: "info.500",
              endIcon: <CheckIcon size={4} />,
            }}
          >
            <Select.Item label={MAP_DATA.MAP_TYPES.STANDARD.LABEL} value={MAP_DATA.MAP_TYPES.STANDARD.VALUE} />
            <Select.Item label={MAP_DATA.MAP_TYPES.SATELLITE.LABEL} value={MAP_DATA.MAP_TYPES.SATELLITE.VALUE} />
            <Select.Item label={MAP_DATA.MAP_TYPES.TERRAIN.LABEL} value={MAP_DATA.MAP_TYPES.TERRAIN.VALUE} />
          </Select>
          {this.state.location != null &&
            <Box flex={1}>
              {!isDrawerOpen && this.props.index == 0 &&
                <Box>
                  <Fab
                    position="absolute"
                    placement='bottom-left'
                    mb={20}
                    colorScheme='danger'
                    icon={<Icon color="black" as={<MaterialCommunityIcons name={ICONS.MCI_UNDO} />} size="sm" />}
                    label={
                      <Text color="black" fontSize="sm">
                        {PLACEHOLDERS.FAB_RESET}
                      </Text>
                    }
                    onPress={this._resetMarkers}
                  />
                  <Fab
                    position="absolute"
                    placement='bottom-left'
                    mb={20}
                    left='37%'
                    colorScheme='gradient_primary'
                    icon={<Icon color="black" as={<MaterialCommunityIcons name={ICONS.MCI_PLUS} />} size="sm" />}
                    label={
                      <Text color="black" fontSize="sm">
                        {PLACEHOLDERS.FAB_POINT}
                      </Text>
                    }
                    onPress={this._addSelectedMarker}
                  />
                  <Fab
                    position="absolute"
                    placement='bottom-right'
                    colorScheme='gradient_secondary'
                    mb={20}
                    icon={<Icon color="black" as={<MaterialCommunityIcons name={this.state.tracking ? ICONS.MCI_PAUSE : ICONS.MCI_PLAY} />} size="sm" />}
                    label={
                      <Text color="black" fontSize="sm">
                        {PLACEHOLDERS.FAB_TRACKING}
                      </Text>
                    }
                    onPress={this.state.tracking ? this._stopTracking : this._startTracking}
                  />
                </Box>
              }
              <Box flex={1}>
                <MapView style={styles.map}
                  loadingEnabled={true}
                  loadingIndicatorColor={colors.primary[300]}
                  loadingBackgroundColor={colors.primary[500]}
                  moveOnMarkerPress={true}
                  showsUserLocation={true}
                  showsCompass={true}
                  mapType={this.state.mapType}
                  provider={MAP_DATA.PROVIDER}
                  initialRegion={this.state.region}
                  onRegionChangeComplete={this._onRegionChangeComplete}
                >
                  {this.state.autoMarkersCordinates.length >= 2 &&
                    <Box>
                      <Marker
                        pinColor={'green'}
                        coordinate={this.state.autoMarkersCordinates[0]}
                      >
                        <Callout>
                          <Box w={200} h={200} >
                            <Center>
                              <Heading fontSize='md' color='success.500' bold>{TITLES.START}</Heading>
                            </Center>
                            <VStack space={1} divider={<Divider />}>
                              <HStack alignItems='center'>
                                <Text fontSize='sm' bold>{TITLES.NAME}</Text>
                                <Text fontSize='sm' position="absolute" right={0}>{this.state.autoMarkers[0].name}</Text>
                              </HStack>
                              <HStack alignItems='center'>
                                <Text fontSize='sm' bold>{TITLES.LATITUDE}</Text>
                                <Text fontSize='sm' position="absolute" right={0}>{String(this.state.autoMarkers[0].latlng.latitude)}</Text>
                              </HStack>
                              <HStack alignItems='center'>
                                <Text fontSize='sm' bold>{TITLES.LONGITUDE}</Text>
                                <Text fontSize='sm' position="absolute" right={0}>{String(this.state.autoMarkers[0].latlng.longitude)}</Text>
                              </HStack>
                              <HStack alignItems='center'>
                                <Text fontSize='sm' bold>{TITLES.ALTITUDE}</Text>
                                <Text fontSize='sm' position="absolute" right={0}>{String(this.state.autoMarkers[0].altitude.toFixed(2))}{TITLES.M}</Text>
                              </HStack>
                              <HStack alignItems='center'>
                                <Text fontSize='sm' bold>{TITLES.TIMESTAMP}</Text>
                                <Text fontSize='sm' position="absolute" right={0}>{this.state.autoMarkers[0].timestamp}</Text>
                              </HStack>
                              <Box />
                            </VStack>
                          </Box>
                        </Callout>
                      </Marker>
                      <Marker
                        pinColor={'red'}
                        coordinate={this.state.autoMarkersCordinates[this.state.autoMarkersCordinates.length - 1]}
                      >
                        <Callout>
                          <Box w={200} h={200} >
                            <Center>
                              <Heading fontSize='md' color='danger.500' bold>{TITLES.END}</Heading>
                            </Center>
                            <VStack space={1} divider={<Divider />}>
                              <HStack alignItems='center'>
                                <Text fontSize='sm' bold>{TITLES.NAME}</Text>
                                <Text fontSize='sm' position="absolute" right={0}>{this.state.autoMarkers[this.state.autoMarkers.length - 1].name}</Text>
                              </HStack>
                              <HStack alignItems='center'>
                                <Text fontSize='sm' bold>{TITLES.LATITUDE}</Text>
                                <Text fontSize='sm' position="absolute" right={0}>{String(this.state.autoMarkers[this.state.autoMarkers.length - 1].latlng.latitude)}</Text>
                              </HStack>
                              <HStack alignItems='center'>
                                <Text fontSize='sm' bold>{TITLES.LONGITUDE}</Text>
                                <Text fontSize='sm' position="absolute" right={0}>{String(this.state.autoMarkers[this.state.autoMarkers.length - 1].latlng.longitude)}</Text>
                              </HStack>
                              <HStack alignItems='center'>
                                <Text fontSize='sm' bold>{TITLES.ALTITUDE}</Text>
                                <Text fontSize='sm' position="absolute" right={0}>{String(this.state.autoMarkers[this.state.autoMarkers.length - 1].altitude.toFixed(2))}{TITLES.M}</Text>
                              </HStack>
                              <HStack alignItems='center'>
                                <Text fontSize='sm' bold>{TITLES.TIMESTAMP}</Text>
                                <Text fontSize='sm' position="absolute" right={0}>{this.state.autoMarkers[this.state.autoMarkers.length - 1].timestamp}</Text>
                              </HStack>
                              <Box />
                            </VStack>
                          </Box>
                        </Callout>
                      </Marker>
                    </Box>

                  }
                  {this.state.selectedMarkers.map((item, index) => (
                    <Marker
                      key={index}
                      ref={ref => { this.marker = ref; }}
                      pinColor={'blue'}
                      coordinate={item.latlng}
                      draggable
                      onCalloutPress={() => this.marker.hideCallout()}
                    >
                      <Callout onPress={() => { this.setState({ showSelectMarkerModal: true, markerOnEditing: item }) }}>
                        <Box w={300} h={280} >
                          <Center>
                            <Heading fontSize='md' color='primary.500' bold>{TITLES.POINT_SELECTED}</Heading>
                          </Center>
                          <VStack space={1} divider={<Divider />}>
                            <HStack alignItems='center'>
                              <Text fontSize='sm' bold>{TITLES.NAME}</Text>
                              <Text fontSize='sm' position="absolute" right={0}>{item.name}</Text>
                            </HStack>
                            <HStack alignItems='center'>
                              <Text fontSize='sm' bold>{TITLES.LATITUDE}</Text>
                              <Text fontSize='sm' position="absolute" right={0}>{String(item.latlng.latitude)}</Text>
                            </HStack>
                            <HStack alignItems='center'>
                              <Text fontSize='sm' bold>{TITLES.LONGITUDE}</Text>
                              <Text fontSize='sm' position="absolute" right={0}>{String(item.latlng.longitude)}</Text>
                            </HStack>
                            <HStack alignItems='center'>
                              <Text fontSize='sm' bold>{TITLES.ALTITUDE}</Text>
                              <Text fontSize='sm' position="absolute" right={0}>{String(item.altitude.toFixed(2))}{TITLES.M}</Text>
                            </HStack>
                            <HStack alignItems='center'>
                              <Text fontSize='sm' bold>{TITLES.DESCRIPTION}</Text>
                              <Text fontSize='sm' position="absolute" right={0}>{item.description}</Text>
                            </HStack>
                            <HStack alignItems='center'>
                              <Text fontSize='sm' bold>{TITLES.OBSERVATIONS}</Text>
                              <Text fontSize='sm' position="absolute" right={0}>{item.observations}</Text>
                            </HStack>
                            <HStack alignItems='center'>
                              <Text fontSize='sm' bold>{TITLES.TIMESTAMP}</Text>
                              <Text fontSize='sm' position="absolute" right={0}>{item.timestamp}</Text>
                            </HStack>
                            <Center>
                              <Heading fontSize='md' color='info.500' bold>{TITLES.TAP_TO_EDIT}</Heading>
                            </Center>
                          </VStack>
                        </Box>
                      </Callout>
                    </Marker>
                  ))}
                  {this.state.autoMarkersCordinates != [] &&
                    <Polyline
                      coordinates={this.state.autoMarkersCordinates}
                      strokeColor={colors.primary[500]} // fallback for when `strokeColors` is not supported by the map-provider
                      strokeWidth={6}
                      lineDashPattern={[1]}
                      lineCap='butt'
                    />
                  }

                </MapView>
                <Box left='50%' ml={-5} mt={-39} bg='transparent' position='absolute' top='50%'>
                  <Image source={LogoMarker} h={10} w={10} alt='fake-marker' />
                </Box>
              </Box>
              {this.state.mapType == MAP_DATA.MAP_TYPES.SATELLITE.VALUE ?
                <Box bg='transparent' position='absolute'>
                  <Text bold color='white'>{TITLES.LATITUDE}{this.state.region.latitude}</Text>
                  <Text bold color='white'>{TITLES.LONGITUDE}{this.state.region.longitude}</Text>
                  <Text bold color='white'>{TITLES.DISTANCE}{parseFloat(this.state.distanceTravelled).toFixed(2)}{TITLES.KM}</Text>
                </Box>
                :
                <Box bg='transparent' position='absolute'>
                  <Text bold>{TITLES.LATITUDE}{this.state.region.latitude}</Text>
                  <Text bold>{TITLES.LONGITUDE}{this.state.region.longitude}</Text>
                  <Text bold>{TITLES.DISTANCE}{parseFloat(this.state.distanceTravelled).toFixed(2)}{TITLES.KM}</Text>
                </Box>
              }

            </Box>
          }

          {/*=========================Selected Markers Modal============================*/}
          {this.state.showSelectMarkerModal &&
            <Modal
              isOpen={this.state.showSelectMarkerModal}
              onClose={() => {
                this.setState({
                  showSelectMarkerModal: false,
                  markerOnEditing: this.blankMarker
                });
              }}
            >
              <Modal.Content>
                <Modal.CloseButton />
                <Modal.Header>{TITLES.EDIT_POINT}</Modal.Header>
                <Modal.Body>
                  <VStack space={1} divider={<Divider />}>
                    <HStack alignItems='center'>
                      <Text fontSize='sm' bold>{TITLES.NAME}</Text>
                      <Input variant='unstyled' size='sm' position="absolute" right={0} value={this.state.markerOnEditing.name} onChange={this._onEditMarkerModalTextChangedName} />
                    </HStack>
                    <HStack alignItems='center'>
                      <Text fontSize='sm' bold>{TITLES.LATITUDE}</Text>
                      <Input variant='unstyled' keyboardType='decimal-pad' size='sm' position="absolute" right={0} value={String(this.state.markerOnEditing.latlng.latitude)} onChange={this._onEditMarkerModalTextChangedLatitude} />
                    </HStack>
                    <HStack alignItems='center'>
                      <Text fontSize='sm' bold>{TITLES.LONGITUDE}</Text>
                      <Input variant='unstyled' keyboardType='decimal-pad' size='sm' position="absolute" right={0} value={String(this.state.markerOnEditing.latlng.longitude)} onChange={this._onEditMarkerModalTextChangedLongitude} />
                    </HStack>
                    <HStack alignItems='center'>
                      <Text fontSize='sm' bold>{TITLES.ALTITUDE}</Text>
                      <Input variant='unstyled' keyboardType='decimal-pad' size='sm' position="absolute" right={0} value={String(this.state.markerOnEditing.altitude.toFixed(2))} onChange={this._onEditMarkerModalTextChangedAltitude} />
                    </HStack>
                    <HStack alignItems='center'>
                      <Text fontSize='sm' bold>{TITLES.DESCRIPTION}</Text>
                    </HStack>
                    <HStack alignItems='center'>
                      <Text fontSize='sm' bold>{TITLES.OBSERVATIONS}</Text>
                      <Input variant='unstyled' size='sm' position="absolute" right={0} value={this.state.markerOnEditing.observations} onChange={this._onEditMarkerModalTextChangedObservations} />
                    </HStack>
                    <HStack alignItems='center'>
                      <Text fontSize='sm' bold>{TITLES.TIMESTAMP}</Text>
                      <Input variant='unstyled' keyboardType='number-pad' size='sm' position="absolute" right={0} value={String(this.state.markerOnEditing.timestamp)} onChange={this._onEditMarkerModalTextChangedTimestamp} />
                    </HStack>
                    <Box />
                  </VStack>

                </Modal.Body>
                <Modal.Footer>
                  <Button.Group variant="ghost" space={2}>
                    <Button
                      colorScheme="info"
                      onPress={() => {
                        this._updateSelectedMarker(this.state.markerOnEditing)
                      }}
                    >
                      {BUTTONS.SAVE}
                    </Button>
                    <Button
                      onPress={() => {
                        this._deleteSelectedMarker(this.state.markerOnEditing.name)
                      }}
                      colorScheme="secondary"
                    >
                      {BUTTONS.DELETE}
                    </Button>
                  </Button.Group>
                </Modal.Footer>
              </Modal.Content>
            </Modal>
          }

        </Box>
      </KeyboardAvoidingView>

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

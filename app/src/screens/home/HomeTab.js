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
  ScrollView,
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
  ICONS,
  SELECT_MARKER_DESCRIPTION_VALUES
} from '../../config/constants';
import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Location from 'expo-location';
import MapView, { Marker, Polyline, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import haversine from 'haversine'
import { useNavigation } from '@react-navigation/native';
import { useIsDrawerOpen } from '@react-navigation/drawer';
import LogoMarker from '../../assets/logoMarker.png';
import { colors } from '../../config/styles';
import { mapStyle } from '../../config/mapStyle';

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
      selectedMarkersCounter: 0,
      renderCallout: null,
      showSelectMarkerModal: false,
      markerOnEditing: {
        id: '',
        latlng: {
          latitude: 0,
          longitude: 0
        },
        altitude: -1,
        distance: -1,
        description: {
          leftSide: '',
          rightSide: '',
          bothSides: '',
          crossCulvert: {
            headType: '',
            state: ''
          },
          ditch: {
            type: ''
          }
        },
        observations: '',
        timestamp: 0
      },
      isTracking: false,
      region: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0,
      },
      mapType: MAP_DATA.MAP_TYPES.STANDARD.VALUE,

    };
    this.blankMarker = {
      id: '',
      latlng: {
        latitude: 0,
        longitude: 0
      },
      altitude: -1,
      distance: 0,
      description: {
        leftSide: '',
        rightSide: '',
        bothSides: '',
        crossCulvert: {
          headType: '',
          state: ''
        },
        ditch: {
          type: ''
        }
      },
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

  _addAutoMarker = async () => { //arreglar la suma de distancias
    let location = await Location.getCurrentPositionAsync({ accuracy: 6 }); // Se obtiene la posición actual
    const newCoordinates = { latitude: location.coords.latitude, longitude: location.coords.longitude } //Se extraen las coordenadas del nuevo marcador
    const len = this.state.autoMarkers.length; //Se obtiene el largo de la lista de marcadores original
    let distance = 0; //Se define la distancia inicial
    if (len >= 1) { //Se verifica que la lista no esté vacia
      const prevCoords = { latitude: this.state.autoMarkers[len - 1].latlng.latitude, longitude: this.state.autoMarkers[len - 1].latlng.longitude } //Se obtienen las coordenadas del último marcador
      distance = this.state.autoMarkers[len - 1].distance + this._calcDistance(prevCoords, newCoordinates);  //Se calcula la distancia entre el último marcador y el nuevo
    }
    const newMarker = { //Se crea el nuevo marcador
      id: 'auto' + String(this.state.autoMarkers.length),
      latlng: {
        latitude: newCoordinates.latitude,
        longitude: newCoordinates.longitude
      },
      altitude: location.coords.altitude,
      distance: distance,
      timestamp: location.timestamp
    }
    this.setState(prevState => ({ //Se actualizan las listas de marcadores y coordenadas
      autoMarkers: [...prevState.autoMarkers, newMarker],
      autoMarkersCordinates: [...prevState.autoMarkersCordinates, newCoordinates]
    }));
  }

  _addSelectedMarker = async () => {
    const newMarker = {
      id: 'selected' + String(this.state.selectedMarkersCounter),
      latlng: { latitude: this.state.region.latitude, longitude: this.state.region.longitude },
      distance: this.state.autoMarkers[this.state.autoMarkers.length - 1].distance,
      altitude: -1,
      description: {
        leftSide: '',
        rightSide: '',
        bothSides: '',
        crossCulvert: {
          headType: '',
          state: ''
        },
        ditch: {
          type: ''
        }
      },
      observations: '',
      timestamp: 0
    }
    this.setState(prevState => ({
      selectedMarkers: [...prevState.selectedMarkers, newMarker],
      selectedMarkersCounter: this.state.selectedMarkersCounter + 1,
      markerOnEditing: newMarker,
      showSelectMarkerModal: true,
    }));

  }

  _calcAltitudeFromCords = (coords) => {
    if (this.state.autoMarkers.length == 1) {
      return this.state.autoMarkers[0].altitude;
    }
    if (this.state.autoMarkers.length > 1) {
      let autoMarkerIndex = 0;
      let deltaLat = coords.latitude - this.state.autoMarkers[autoMarkerIndex].latlng.latitude;
      let deltaLng = coords.longitude - this.state.autoMarkers[autoMarkerIndex].latlng.longitude;
      for (let i = 1; i < this.state.autoMarkers.length; i++) {
        let newDeltaLat = coords.latitude - this.state.autoMarkers[i].latlng.latitude;
        let newDeltaLng = coords.longitude - this.state.autoMarkers[i].latlng.longitude;
        if (Math.abs(deltaLat) > Math.abs(newDeltaLat) && Math.abs(deltaLng) > Math.abs(newDeltaLng)) {
          deltaLat = newDeltaLat;
          deltaLng = newDeltaLng;
          autoMarkerIndex = i;
        }
      }
      return this.state.autoMarkers[autoMarkerIndex].altitude;
    } else {
      return -1
    }
  }

  _calcDistance = (newLatLng, prevLatLng) => {
    return haversine(prevLatLng, newLatLng) || 0;
  };

  _deleteSelectedMarker = (markerId) => {
    let markers = Array.from(this.state.selectedMarkers);
    let markerIndex = -1;
    for (let i = 0; i < this.state.selectedMarkers.length; i++) {
      if (this.state.selectedMarkers[i].id == markerId) {
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
      if (this.state.selectedMarkers[i].id == marker.id) {
        markerIndex = i;
        break;
      }
    }
    if (markerIndex !== -1) {
      markers[markerIndex] = marker;
      this.setState({ selectedMarkers: markers, markerOnEditing: this.blankMarker, showSelectMarkerModal: false, })
    }
  }

  _onEditMarkerModalTextChangedRightSide = event => {
    let marker = JSON.parse(JSON.stringify(this.state.markerOnEditing));
    marker.description.rightSide = event.nativeEvent.text;
    this.setState({
      markerOnEditing: marker
    });
  };

  _onEditMarkerModalButtonPressedRightSide = value => {
    let marker = JSON.parse(JSON.stringify(this.state.markerOnEditing));
    if (marker.description.rightSide !== '') {
      marker.description.rightSide = marker.description.rightSide + ', ' + value;
    } else {
      marker.description.rightSide = marker.description.rightSide + value;
    }
    this.setState({
      markerOnEditing: marker
    });
  };


  _onEditMarkerModalTextChangedLeftSide = event => {
    let marker = JSON.parse(JSON.stringify(this.state.markerOnEditing));
    marker.description.leftSide = event.nativeEvent.text;
    this.setState({
      markerOnEditing: marker
    });
  };

  _onEditMarkerModalButtonPressedLeftSide = value => {
    let marker = JSON.parse(JSON.stringify(this.state.markerOnEditing));
    if (marker.description.leftSide !== '') {
      marker.description.leftSide = marker.description.leftSide + ', ' + value;
    } else {
      marker.description.leftSide = marker.description.leftSide + value;
    }

    this.setState({
      markerOnEditing: marker
    });
  };

  _onEditMarkerModalTextChangedBothSides = event => {
    let marker = JSON.parse(JSON.stringify(this.state.markerOnEditing));
    marker.description.bothSides = event.nativeEvent.text;
    this.setState({
      markerOnEditing: marker
    });
  };

  _onEditMarkerModalButtonPressedBothSides = value => {
    let marker = JSON.parse(JSON.stringify(this.state.markerOnEditing));
    if (marker.description.bothSides !== '') {
      marker.description.bothSides = marker.description.bothSides + ', ' + value;
    } else {
      marker.description.bothSides = marker.description.bothSides + value;
    }
    this.setState({
      markerOnEditing: marker
    });
  };

  _onEditMarkerModalTextChangedCrossCulvertHeadType = value => {
    let marker = JSON.parse(JSON.stringify(this.state.markerOnEditing));
    marker.description.crossCulvert.headType = value;
    this.setState({
      markerOnEditing: marker
    });
  };

  _onEditMarkerModalTextChangedCrossCulvertState = value => {
    let marker = JSON.parse(JSON.stringify(this.state.markerOnEditing));
    marker.description.crossCulvert.state = value;
    this.setState({
      markerOnEditing: marker
    });
  };

  _onEditMarkerModalTextChangedDitchType = value => {
    let marker = JSON.parse(JSON.stringify(this.state.markerOnEditing));
    marker.description.ditch.type = value;
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

  _onEditMarkerModalTextChangedDistance = event => {
    let marker = JSON.parse(JSON.stringify(this.state.markerOnEditing));
    marker.distance = Number(event.nativeEvent.text);
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
      selectedMarkersCounter: 0,
      isTracking: false,
    });
  }

  _startTracking = async () => {
    this.setState({ isTracking: true });
    this._addAutoMarker();
    this.trackingInterval = setInterval(() => this._addAutoMarker(), 5000);
  }

  _stopTracking = () => {
    clearInterval(this.trackingInterval);
    this.setState({ isTracking: false });
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
                  {this.state.isTracking ?
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
                        onPress={() => { this._addSelectedMarker(); this._stopTracking(); }}
                      />
                      <Fab
                        position="absolute"
                        placement='bottom-right'
                        colorScheme='gradient_secondary'
                        mb={20}
                        icon={<Icon color="black" as={<MaterialCommunityIcons name={this.state.isTracking ? ICONS.MCI_PAUSE : ICONS.MCI_PLAY} />} size="sm" />}
                        label={
                          <Text color="black" fontSize="sm">
                            {PLACEHOLDERS.FAB_TRACKING}
                          </Text>
                        }
                        onPress={this.state.isTracking ? this._stopTracking : this._startTracking}
                      />
                    </Box>
                    :
                    <Fab
                      placement='bottom-right'
                      colorScheme='gradient_secondary'
                      mb={20}
                      right='36%'
                      icon={<Icon color="black" as={<MaterialCommunityIcons name={this.state.isTracking ? ICONS.MCI_PAUSE : ICONS.MCI_PLAY} />} size="sm" />}
                      label={
                        <Text color="black" fontSize="sm">
                          {PLACEHOLDERS.FAB_TRACKING}
                        </Text>
                      }
                      onPress={this.state.isTracking ? this._stopTracking : this._startTracking}
                    />
                  }
                </Box>
              }
              <Box flex={1}>
                <MapView style={styles.map}
                  customMapStyle={mapStyle[1]}
                  loadingEnabled={true}
                  loadingIndicatorColor={colors.primary[300]}
                  loadingBackgroundColor={colors.primary[500]}
                  moveOnMarkerPress={false}
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
                                <Text fontSize='sm' bold>{TITLES.ID}</Text>
                                <Text fontSize='sm' position="absolute" right={0}>{this.state.autoMarkers[0].id}</Text>
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
                                <Text fontSize='sm' bold>{TITLES.DISTANCE}</Text>
                                <Text fontSize='sm' position="absolute" right={0}>{String(this.state.autoMarkers[0].distance.toFixed(2))}{TITLES.KM}</Text>
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
                                <Text fontSize='sm' bold>{TITLES.ID}</Text>
                                <Text fontSize='sm' position="absolute" right={0}>{this.state.autoMarkers[this.state.autoMarkers.length - 1].id}</Text>
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
                                <Text fontSize='sm' bold>{TITLES.DISTANCE}</Text>
                                <Text fontSize='sm' position="absolute" right={0}>{String(this.state.autoMarkers[this.state.autoMarkers.length - 1].distance.toFixed(2))}{TITLES.KM}</Text>
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
                      pinColor={'aqua'}
                      coordinate={item.latlng}
                      onPress={() => { this.setState({ renderCallout: index }); }} //BUG: No se renderea el callout hasta el segundo press
                      onCalloutPress={() => { this.marker.hideCallout(); }}
                    >
                      <Callout onTouchCancel={() => this.setState({ renderCallout: null })} onPress={() => { this.setState({ showSelectMarkerModal: true, renderCallout: null, markerOnEditing: item }); }}>
                        {this.state.renderCallout === index &&
                          <Box w={300} h={250}>
                            <Center>
                              <Heading fontSize='md' color='primary.500' bold>{TITLES.POINT_SELECTED}</Heading>
                            </Center>
                            <VStack space={1} divider={<Divider />}>
                              <HStack alignItems='center'>
                                <Text fontSize='sm' bold>{TITLES.ID}</Text>
                                <Text fontSize='sm' position="absolute" right={0}>{item.id}</Text>
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
                                <Text fontSize='sm' bold>{TITLES.DISTANCE}</Text>
                                <Text fontSize='sm' position="absolute" right={0}>{String(item.distance.toFixed(2))}{TITLES.KM}</Text>
                              </HStack>
                              <HStack alignItems='center'>
                                <Text fontSize='sm' bold>{TITLES.OBSERVATIONS}</Text>
                                <Text fontSize='sm' w='60%' isTruncated={true} position="absolute" right={0}>{item.observations}</Text>
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
                        }
                      </Callout>
                    </Marker>
                  ))}
                  {this.state.autoMarkersCordinates != [] &&
                    <Polyline
                      coordinates={this.state.autoMarkersCordinates}
                      strokeColor={colors.gradient_primary[500]}
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
                  {this.state.autoMarkers.length > 0
                    ?
                    <Text bold color='white'>{TITLES.DISTANCE}{parseFloat(this.state.autoMarkers[this.state.autoMarkers.length - 1].distance).toFixed(2)}{TITLES.KM}</Text>
                    :
                    <Text bold color='white'>{TITLES.DISTANCE}{TITLES.ZERO}{TITLES.KM}</Text>

                  }

                </Box>
                :
                <Box bg='transparent' position='absolute'>
                  <Text bold>{TITLES.LATITUDE}{this.state.region.latitude}</Text>
                  <Text bold>{TITLES.LONGITUDE}{this.state.region.longitude}</Text>
                  {this.state.autoMarkers.length > 0
                    ?
                    <Text bold>{TITLES.DISTANCE}{parseFloat(this.state.autoMarkers[this.state.autoMarkers.length - 1].distance).toFixed(2)}{TITLES.KM}</Text>
                    :
                    <Text bold>{TITLES.DISTANCE}{TITLES.ZERO}{TITLES.KM}</Text>

                  }
                </Box>
              }
            </Box>
          }

          {/*=========================Selected Markers Modal============================*/}
          {this.state.showSelectMarkerModal &&
            <Modal
              isOpen={this.state.showSelectMarkerModal}
              size='full'
              onClose={() => {
                this.setState({
                  showSelectMarkerModal: false,
                  markerOnEditing: this.blankMarker
                });
                this._startTracking();
              }}
            >
              <Modal.Content flex={1}>
                <Modal.CloseButton />
                <Modal.Header>{TITLES.EDIT_POINT + this.state.markerOnEditing.id}</Modal.Header>
                <Modal.Body>
                  <ScrollView>
                    <VStack space={1} divider={<Divider />}>
                      <VStack space={3}>
                        <Text fontSize='md' bold>{TITLES.DESCRIPTION}</Text>
                        <VStack space={2}>
                          <HStack alignItems='center'>
                            <Text fontSize='sm' bold>{TITLES.RIGHT_SIDE}</Text>
                            <Input fontSize='sm' variant='underlined' textAlign='right' w='70%' keyboardType='default' position="absolute" right={0} value={this.state.markerOnEditing.description.rightSide} onChange={this._onEditMarkerModalTextChangedRightSide} />
                          </HStack>
                          <ScrollView horizontal={true} ml={3}>
                            <HStack mt={4} space={1}>
                              {SELECT_MARKER_DESCRIPTION_VALUES.SIDES.map((item, index) => (
                                <Button key={index} size='sm' alignSelf="center" variant="solid" onPress={() => { this._onEditMarkerModalButtonPressedRightSide(item.value) }}>
                                  {item.label}
                                </Button>
                              ))}

                            </HStack>
                          </ScrollView>
                        </VStack>
                        <VStack space={2}>
                          <HStack alignItems='center'>
                            <Text fontSize='sm' bold>{TITLES.LEFT_SIDE}</Text>
                            <Input fontSize='sm' variant='underlined' textAlign='right' w='70%' keyboardType='default' position="absolute" right={0} value={this.state.markerOnEditing.description.leftSide} onChange={this._onEditMarkerModalTextChangedLeftSide} />
                          </HStack>
                          <ScrollView horizontal={true} ml={3}>
                            <HStack mt={4} space={1}>
                              {SELECT_MARKER_DESCRIPTION_VALUES.SIDES.map((item, index) => (
                                <Button key={index} size='sm' alignSelf="center" variant="solid" onPress={() => { this._onEditMarkerModalButtonPressedLeftSide(item.value) }}>
                                  {item.label}
                                </Button>
                              ))}

                            </HStack>
                          </ScrollView>
                        </VStack>
                        <VStack space={2}>
                          <HStack alignItems='center'>
                            <Text fontSize='sm' bold>{TITLES.BOTH_SIDES}</Text>
                            <Input fontSize='sm' variant='underlined' textAlign='right' w='70%' keyboardType='default' position="absolute" right={0} value={this.state.markerOnEditing.description.bothSides} onChange={this._onEditMarkerModalTextChangedBothSides} />
                          </HStack>
                          <ScrollView horizontal={true} ml={3}>
                            <HStack mt={4} space={1}>
                              {SELECT_MARKER_DESCRIPTION_VALUES.SIDES.map((item, index) => (
                                <Button key={index} size='sm' alignSelf="center" variant="solid" onPress={() => { this._onEditMarkerModalButtonPressedBothSides(item.value) }} >
                                  {item.label}
                                </Button>
                              ))}

                            </HStack>
                          </ScrollView>
                        </VStack>
                        <Divider />
                        <VStack>
                          <Text fontSize='sm' bold>{TITLES.CROSS_CULVERT}</Text>
                          <Select
                            ml={3}
                            position='relative'
                            accessibilityLabel={TITLES.HEAD_TYPE}
                            placeholder={TITLES.HEAD_TYPE}
                            color='primary.500'
                            placeholderTextColor='primary.500'
                            value={this.state.markerOnEditing.description.crossCulvert.headType}
                            onValueChange={this._onEditMarkerModalTextChangedCrossCulvertHeadType}
                            _selectedItem={{
                              bg: "primary.500",
                              endIcon: <CheckIcon size={4} />,
                            }}
                          >
                            {SELECT_MARKER_DESCRIPTION_VALUES.CROSS_CULVERT.HEAD_TYPE.map((item, index) => (
                              <Select.Item key={index} label={item} value={item} />
                            ))}
                          </Select>
                          <Select
                            ml={3}
                            position='relative'
                            accessibilityLabel={TITLES.STATE}
                            placeholder={TITLES.STATE}
                            color='primary.500'
                            placeholderTextColor='primary.500'
                            value={this.state.markerOnEditing.description.crossCulvert.state}
                            onValueChange={this._onEditMarkerModalTextChangedCrossCulvertState}
                            _selectedItem={{
                              bg: "primary.500",
                              endIcon: <CheckIcon size={4} />,
                            }}
                          >
                            {SELECT_MARKER_DESCRIPTION_VALUES.CROSS_CULVERT.STATE.map((item, index) => (
                              <Select.Item key={index} label={item} value={item} />
                            ))}
                          </Select>
                        </VStack>
                        <Divider />
                        <VStack>
                          <Text fontSize='sm' bold>{TITLES.DITCH}</Text>
                          <Select
                            variant='underlined'
                            ml={3}
                            position='relative'
                            accessibilityLabel={TITLES.DITCH_TYPE}
                            placeholder={TITLES.DITCH_TYPE}
                            color='primary.500'
                            placeholderTextColor='primary.500'
                            value={this.state.markerOnEditing.description.ditch.type}
                            onValueChange={this._onEditMarkerModalTextChangedDitchType}
                            _selectedItem={{
                              bg: "primary.500",
                              endIcon: <CheckIcon size={4} />,
                            }}
                          >
                            {SELECT_MARKER_DESCRIPTION_VALUES.DITCH.map((item, index) => (
                              <Select.Item key={index} label={item} value={item} />
                            ))}
                          </Select>
                        </VStack>
                      </VStack>
                      <HStack alignItems='center'>
                        <Text fontSize='md' bold>{TITLES.OBSERVATIONS}</Text>
                        <Input
                          variant='unstyled'
                          textAlign='right'
                          size='md' w='65%'
                          position="absolute"
                          right={0}
                          value={this.state.markerOnEditing.observations}
                          onChange={this._onEditMarkerModalTextChangedObservations}
                        />
                      </HStack>
                      <HStack alignItems='center'>
                        <Text fontSize='md' bold>{TITLES.DISTANCE_KM}</Text>
                        <Input variant='unstyled' keyboardType='decimal-pad' textAlign='right' size='md' w='65%' position="absolute" right={0} value={String(this.state.markerOnEditing.distance.toFixed(2))} onChange={this._onEditMarkerModalTextChangedDistance} />
                      </HStack>
                      <Box />
                    </VStack>
                  </ScrollView>
                </Modal.Body>
                <Modal.Footer>
                  <Button.Group variant="ghost" space={2}>
                    <Button
                      colorScheme="info"
                      onPress={() => {
                        this._updateSelectedMarker(this.state.markerOnEditing);
                        this._startTracking();
                      }}
                    >
                      {BUTTONS.SAVE}
                    </Button>
                    <Button
                      onPress={() => {
                        this._deleteSelectedMarker(this.state.markerOnEditing.id);
                        this._startTracking();
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

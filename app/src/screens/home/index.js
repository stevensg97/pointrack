
import React, { Component } from 'react';
import { Dimensions, Animated, Pressable } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import { useNavigation } from '@react-navigation/native';
import { useIsDrawerOpen } from '@react-navigation/drawer';
import { Box, HStack, VStack, HamburgerIcon, Center, Heading, Divider, StatusBar, Icon, Image } from 'native-base';
import {
  MaterialCommunityIcons
} from '@expo/vector-icons';
import { colors } from '../../config/styles';
import { ICONS, TITLES } from '../../config/constants'
import HomeTab from './HomeTab';
import InventaryTab from './InventaryTab';
import IconImage from '../../assets/icon.png';

const initialLayout = { width: Dimensions.get('window').width };

class HomeScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isReady: false,
      index: 0,
      routes: [
        { key: 'home', title: 'Inicio', iconSelected: ICONS.MCI_HOME, icon: ICONS.MCI_HOME_OUTLINE },
        { key: 'inventary', title: 'Inventario', iconSelected: ICONS.MCI_ARCHIVE, icon: ICONS.MCI_ARCHIVE_OUTLINE },
      ]
    };
  }

  componentDidMount() {
    this.setState({ isReady: true });
  }

  _handleIndexChange = (index) => this.setState({ index });

  _renderTabBar = (props) => {
    const inputRange = props.navigationState.routes.map((x, i) => i);

    return (
      <Box flexDirection="row">
        {props.navigationState.routes.map((route, i) => {
          const opacity = props.position.interpolate({
            inputRange,
            outputRange: inputRange.map((inputIndex) =>
              inputIndex === i ? 1 : 0.5
            ),
          });

          return (
            <Box
              flex={1}
              alignItems='center'
              p={2}
              key={route.key}
              bg='primary.500'
            >
              <Pressable
                onPress={() => this.setState({ index: i })}>
                <VStack alignItems='center'>
                  {this.state.index == i ? <Icon size='sm' color='white' as={<MaterialCommunityIcons name={route.iconSelected} />} />
                    : <Icon size='sm' color='ligthwhite' as={<MaterialCommunityIcons name={route.icon} />} />}
                  <Animated.Text style={{ opacity, color: colors.white, fontSize: 16 }}>{route.title}</Animated.Text>
                </VStack>
              </Pressable>
            </Box>


          );
        })}
      </Box>
    );
  };

  _renderScene = SceneMap({
    home: HomeTab, //HomeTab
    inventary: InventaryTab, //InventaryTab
  });

  renderScene = ({ route }) => {
    switch (route.key) {
      case 'home':
        return <HomeTab index={this.state.index}/>;
      case 'inventary':
        return <InventaryTab />;
      default:
        return null;
    }
  };

  render() {
    const { navigation } = this.props;

    return (
      <Box flex={1}>
        <StatusBar backgroundColor={colors.primary[600]} barStyle="light-content" />
        <HStack alignItems="center" py={4} bg='primary.500'>
          <Pressable onPress={() => navigation.toggleDrawer()} _pressed={{ opacity: 0.5 }} position="absolute" ml={2} zIndex={1}>
            <HamburgerIcon ml={2} size="md" color='white' />
          </Pressable>
          <Center flex={1} >
            <HStack>
              <Heading size="md" color='white'>{TITLES.POINTRACK}</Heading>
              <Image
                w={7}
                h={7}
                resizeMode="contain"
                source={IconImage}
                alt={"Icon"}
              />
            </HStack>

          </Center>
        </HStack>
        <Divider />
        <TabView
          navigationState={this.state}
          renderScene={this.renderScene}
          onIndexChange={this._handleIndexChange}
          renderTabBar={this._renderTabBar}
          tabBarPosition='bottom'
          initialLayout={initialLayout}
          index={this.state.index}
          style={{ marginTop: StatusBar.currentHeight }}
        />
      </Box>

    );
  }


}

export default function (props) {
  //const navigation = useNavigation();
  //const isDrawerOpen = useIsDrawerOpen();

  return <HomeScreen {...props} /* navigation={navigation} */ /* isDrawerOpen={isDrawerOpen} */ />;
}

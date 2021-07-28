import React, { useState, useEffect } from 'react';
import {
  Text,
  Avatar,
  Box,
  HStack,
  VStack,
  ZStack,
  Divider,
  Pressable,
  Heading,
  AspectRatio,
  Icon,
  Image
} from 'native-base';
import {
  Mate,
  MaterialCommunityIcons
} from '@expo/vector-icons';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import IconLogo from '../../assets/logo.png';
import IconUser from '../../assets/user.jpg';
import DrawerBackground from '../../assets/drawerBackground.png';
import { TITLES, DRAWER_OPTIONS } from '../../config/constants';
import { colors } from '../../config/styles';



export default function DrawerContent(props) {
  return (

    <DrawerContentScrollView {...props} safeArea>
      <VStack>
        <AspectRatio ratio={17 / 9} >
          <ZStack alignItems="center" justifyContent="center">
            <Box>
              <Image
                source={DrawerBackground}
                alt='DrawerBackground'
                resizeMode='contain'
              />

            </Box>
            <Box>
              <Image
                source={IconLogo}
                alt='Logo'
                height={120}
                width={120}
              />
            </Box>
          </ZStack>
        </AspectRatio>
        <HStack space={4} alignItems="center" p={2} pt={3}>
          <Avatar source={IconUser}></Avatar>
          <Heading size="sm" ml={-1}>
            {TITLES.BIENVENIDO}
          </Heading>
        </HStack>
        <Divider />
        <VStack divider={<Divider />}>
          {DRAWER_OPTIONS.map((option) => (
            <Pressable _pressed={{opacity: 0.5}} key={option[0]} onPress={() => props.navigation.navigate(option[0])} py={2}>
              <HStack space={4} px={4} py={3} alignItems='center'>
                <Icon as={<MaterialCommunityIcons name={option[2]} />}></Icon>
                <Text>{option[1]}</Text>
              </HStack>
            </Pressable>
          ))}
          <Pressable  onPress={() => {}} py={2}>
              <HStack space={4} px={4} py={3} alignItems='center'>
                <Icon as={<MaterialCommunityIcons name={'logout'} />}></Icon>
                <Text>Cerrar Sesión</Text>
              </HStack>
            </Pressable>
        </VStack>
        <Divider />
      </VStack>
    </DrawerContentScrollView>
  );
}

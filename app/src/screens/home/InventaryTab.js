import React, { Component } from 'react';
import {
  Box
} from 'native-base';
import {
  SCREENS,
  ALERTS,
  BUTTONS,
  TITLES,
} from '../../config/constants';
import { useNavigation } from '@react-navigation/native';


class InventaryTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  render() {
    const { navigation } = this.props;
    return (
      <Box flex={1} bg='gradient_secondary'>
        
      </Box>
    );
  }
}

export default function (props) {
  const navigation = useNavigation();

  return <InventaryTab {...props} navigation={navigation} />;
}

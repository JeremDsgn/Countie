/* eslint-disable react-native/split-platform-components */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';

export default class Button extends PureComponent {

  static propTypes = {
    children: PropTypes.node.isRequired,
    onPress: PropTypes.func,
  }

  static defaultProps = {
    onPress: () => {},
  }

  render() {
    const { children, onPress } = this.props;

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
      >
        <Text style={s.button}>{children.toUpperCase()}</Text>
      </TouchableOpacity>
    );
  }
}

const s = StyleSheet.create({
  button: {
    paddingVertical: 15,

    fontFamily: 'Avenir-Heavy',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 1,
    textAlign: 'center',

    backgroundColor: 'transparent',
  },
});
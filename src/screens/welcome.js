/* eslint-disable max-len */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import moment from 'moment';

import Container from '../components/container';
import DatePicker from '../components/date-picker';

export default class Welcome extends PureComponent {

  static propTypes = {
    navigator: PropTypes.shape({
      push: PropTypes.func.isRequired,
      pop: PropTypes.func.isRequired,
    }).isRequired,
    date: PropTypes.string,
  }

  static defaultProps = {
    date: new Date(),
  }

  state = {
    date: this.props.date,
    pickerIsShown: false,
  }

  onDateChange = (date) => {
    this.setState({ date });
  }

  submit = () => {
    const { date } = this.state;

    const to = moment(date).startOf('day').toDate();
    const from = new Date();
    const diff = to.getTime() - from.getTime();

    if (diff <= 0) return;

    this.props.navigator.push('counter', { from, to });
  }

  togglePicker = () => {
    const { pickerIsShown } = this.state;
    this.setState({ pickerIsShown: !pickerIsShown });
  }

  render() {
    const { pickerIsShown, date } = this.state;

    return (
      <Container>
        <View style={s.welcome__form}>
          <Text style={s.welcome__text}>
            Let’s count <Text style={s.welcome__placeholder} onPress={this.togglePicker}>days</Text> to <Text style={s.welcome__placeholder}>my next travel</Text>.
          </Text>

          <DatePicker
            open={pickerIsShown}
            toggle={this.togglePicker}
            date={date}
            onChange={this.onDateChange}
          />

          <TouchableOpacity
            onPress={this.submit}
            activeOpacity={0.75}
            style={s.welcome__submit}
          >
            <Image source={require('../images/submit.png')} />
          </TouchableOpacity>
        </View>

        <Text style={s.welcome__footer}>
          Photographs by <Text style={s.welcome__link} onPress={() => Linking.openURL('https://www.instagram.com/jeremdsgn/')}>@jeremdsgn</Text>
        </Text>
      </Container>
    );
  }
}

const s = StyleSheet.create({
  welcome__form: {
    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 200,
  },

  welcome__text: {
    paddingHorizontal: 50,

    fontFamily: 'Avenir-Medium',
    fontSize: 32,
    color: '#333333',
    lineHeight: 42,
    textAlign: 'center',
  },

  welcome__placeholder: {
    color: '#c1ccdb',
    textDecorationLine: 'underline',
  },

  welcome__submit: {
    marginTop: 60,
  },

  welcome__footer: {
    marginTop: 'auto',
    marginBottom: 30,

    fontFamily: 'Avenir-Medium',
    fontSize: 15,
    color: '#c1ccdb',
    textAlign: 'center',
  },

  welcome__link: {
    color: '#6ef09f',
  },
});

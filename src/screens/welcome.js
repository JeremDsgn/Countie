/* eslint-disable max-len */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import moment from 'moment';
import { isNil } from 'lodash';
import { inject, observer } from 'mobx-react/native';

import Container from '../components/container';
import Picker from '../components/picker';
import Input from '../components/input';
import storage, { prefix } from '../utils/storage';

const PLACEHOLDER_DATE = 'date';
const PLACEHOLDER_TEXT = 'my next travel';

@inject('ui')
@observer
export default class Welcome extends Component {

  static propTypes = {
    navigator: PropTypes.shape({
      push: PropTypes.func.isRequired,
      pop: PropTypes.func.isRequired,
    }).isRequired,
    ui: PropTypes.object.isRequired,
  }

  state = {
    pickerIsShown: false,
    inputIsShown: false,
  }

  async componentWillMount() {
    const lastOpened = new Date();

    try {
      const lastClosed = await storage.get(prefix('last_closed'));

      if (lastClosed) {
        await this.props.ui.timeDifference(lastClosed, lastOpened);
      }
    } catch (error) {
      console.log(error) // eslint-disable-line
    }
  }

  onDateChange = (to) => {
    this.props.ui.counter.to = to;
  }

  onTextChange = (text) => {
    this.props.ui.counter.text = text;
  }

  submit = () => {
    const { ui, navigator } = this.props;

    // const to = moment(new Date().setSeconds(new Date().getSeconds() + 50)).toDate();
    const to = moment(ui.counter.to).startOf('day').toDate();
    const from = new Date();
    const diff = to.getTime() - from.getTime();

    if (isNil(ui.counter.text) || isNil(ui.counter.to)) return;
    if (diff <= 0) return;

    navigator.push('counter', { from, to, text: ui.counter.text });
  }

  togglePicker = () => {
    const { pickerIsShown } = this.state;
    this.props.ui.showDate = true;
    this.setState({ pickerIsShown: !pickerIsShown });
  }

  toggleInput = () => {
    const { inputIsShown } = this.state;
    this.setState({ inputIsShown: !inputIsShown });
  }

  render() {
    const { ui } = this.props;
    const { pickerIsShown, inputIsShown } = this.state;

    const isClickable = ui.counter.to && ui.counter.text;
    const valueDate = ui.showDate ? moment(ui.counter.to).format('DD/MM/YY') : PLACEHOLDER_DATE;
    const valueText = ui.counter.text || PLACEHOLDER_TEXT;
    const styles = state => state ? s.welcome__value : s.welcome__placeholder; // eslint-disable-line

    return (
      <Container>
        <View style={s.welcome__form}>
          <Text style={s.welcome__text}>
            Let’s count <Text style={styles(ui.showDate)} onPress={this.togglePicker}>{valueDate}</Text>{'\n'} for <Text style={styles(ui.counter.text)} onPress={this.toggleInput}>{valueText}</Text>.
          </Text>

          <Picker
            open={pickerIsShown}
            toggle={this.togglePicker}
            date={ui.counter.to}
            onChange={this.onDateChange}
          />

          <Input
            open={inputIsShown}
            toggle={this.toggleInput}
            text={ui.counter.text}
            placeholder={PLACEHOLDER_TEXT}
            onChange={this.onTextChange}
          />

          <TouchableOpacity
            onPress={this.submit}
            activeOpacity={0.75}
            style={s.welcome__submit}
          >
            <Image
              style={isClickable ? s.welcome__iconActive : s.welcome__icon}
              source={require('../images/submit.png')}
            />
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
    paddingHorizontal: 30,

    fontFamily: 'Avenir-Medium',
    fontSize: 32,
    color: '#333',
    lineHeight: 46,
    textAlign: 'center',
  },

  welcome__placeholder: {
    color: '#c1ccdb',
    textDecorationLine: 'underline',
  },

  welcome__value: {
    color: '#6ef09f',
    textDecorationLine: 'underline',
  },

  welcome__submit: {
    marginTop: 60,
  },

  welcome__icon: {
    tintColor: '#c1ccdb',
  },

  welcome__iconActive: {
    tintColor: '#6ef09f',
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
    color: '#a2abb8',
  },
});

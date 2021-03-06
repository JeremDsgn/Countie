/* eslint-disable max-len */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Platform, DatePickerAndroid } from 'react-native';
import moment from 'moment';
import { isNil, isEmpty } from 'lodash';
import { inject, observer } from 'mobx-react/native';
import { action, observable } from 'mobx';
import { decorate } from 'react-mixin';
import TimerMixin from 'react-native-timer-mixin';
import PushNotification from 'react-native-push-notification';

import Container from 'components/container';
import Picker from 'components/picker';
import Input from 'components/input';
import storage, { prefix } from 'utils/storage';
import { datify } from 'utils/date';
import { navigatorTypes } from 'utils/types';
import { isIpad } from 'utils/utils';
import { fonts } from 'theme';

import { COUNTER } from './';

const PLACEHOLDER_DATE = 'date';
const PLACEHOLDER_TEXT = 'my next travel';
const TWENTYFOUR_HOURS = 24 * 60 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

@inject('ui')
@observer
@decorate(TimerMixin)
export default class Welcome extends Component {

  static propTypes = {
    ...navigatorTypes,
    ui: PropTypes.object.isRequired,
  }

  static navigatorStyle = {
    navBarHidden: true,
  }

  @observable
  showBackButton = false;

  state = {
    pickerIsShown: false,
    inputIsShown: false,
  }

  componentDidMount() {
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
  }

  @action
  onNavigatorEvent = (e) => {
    const { counters } = this.props.ui;

    if (e.id === 'willAppear') {
      this.showBackButton = counters.size > 0;
    }
  }

  @action
  onDateChange = (to) => {
    this.props.ui.firstPickDate = true;
    this.props.ui.counterTo = to;
  }

  @action
  onTextChange = (text) => {
    this.props.ui.firstPickText = true;
    this.props.ui.counterText = text;
  }

  @action
  submit = () => {
    const { ui, navigator } = this.props;
    const { counters, counterText: text, counterTo } = ui;

    const from = new Date();
    const to = moment(counterTo).startOf('day').toDate();
    const diff = to.getTime() - from.getTime();

    // Check if counter is valid
    if (isEmpty(text) || isNil(counterTo)) return;
    if (diff <= 0) return;

    const name = moment(from).format('DD-MM-YY/HH:mm:ss');
    const unixed = Number(moment(to).format('x'));
    const index = counters.size + 1;
    const obj = { from, to, text, status: datify(diff) };
    const counter = { [name]: obj };

    // Configure notifications
    if (diff >= TWENTYFOUR_HOURS) {
      PushNotification.localNotificationSchedule({
        id: index,
        userInfo: { id: index },
        message: `Your countdown for « ${text} » is almost over, 24 hours remaining!`,
        date: new Date(unixed - TWENTYFOUR_HOURS),
      });
    }

    if (diff >= ONE_HOUR) {
      PushNotification.localNotificationSchedule({
        id: index,
        userInfo: { id: index },
        message: `Your countdown for « ${text} » is so close to be over, 1 hour remaining!`,
        date: new Date(unixed - ONE_HOUR),
      });
    }

    PushNotification.localNotificationSchedule({
      id: index,
      userInfo: { id: index },
      message: `Hey! This is it, your countdown for « ${text} » is over. Make the most of your time!`,
      date: new Date(unixed),
    });

    ui.updateStatus(from);
    ui.counters.set(name, obj);
    ui.currentCounter = name;
    storage.update(prefix('counters'), counter);

    navigator.showModal({
      screen: COUNTER,
      animationType: 'slide-up',
    });
  }

  togglePickerAndroid = async () => {
    try {
      await DatePickerAndroid
        .open({ date: this.props.ui.counterTo })
        .then(({ action, year, month, day }) => { // eslint-disable-line
          if (action !== DatePickerAndroid.dismissedAction) {
            this.props.ui.setAndroidDate(new Date(year, month, day));
          }
        });
    } catch ({ code, message }) {
      console.error(`Cannot open date picker ${code} ${message}`);
    }
  }

  @action
  togglePicker = () => {
    if (Platform.OS === 'android') {
      return this.togglePickerAndroid();
    }

    const { pickerIsShown } = this.state;

    if (pickerIsShown) {
      this.props.ui.firstPickDate = true;
    }

    this.props.ui.showDate = true;
    this.setState({ pickerIsShown: !pickerIsShown });
  }

  @action
  toggleInput = () => {
    const { inputIsShown } = this.state;

    if (inputIsShown) {
      this.props.ui.firstPickText = true;
    }

    this.setState({ inputIsShown: !inputIsShown });
  }

  backToModal = () => {
    this.props.ui.updateStatus(new Date());

    this.props.navigator.showModal({
      screen: COUNTER,
      animationType: 'slide-up',
    });
  }

  render() {
    const { showDate, firstPickDate, firstPickText, counterText, counterTo } = this.props.ui;
    const { pickerIsShown, inputIsShown } = this.state;

    const validDate = moment(counterTo).isAfter(new Date());
    const validText = !isEmpty(counterText);
    const isClickable = validDate && validText;

    const valueDate = showDate ? moment(counterTo).format('DD/MM/YY') : PLACEHOLDER_DATE;
    const valueText = counterText || PLACEHOLDER_TEXT;
    const styles = state => state ? s.welcome__value : s.welcome__placeholder;

    const breakLine = isIpad() ? ' ' : '\n';

    return (
      <Container>
        {this.showBackButton && (
          <TouchableOpacity
            style={s.welcome__backButton}
            onPress={this.backToModal}
            activeOpacity={0.75}
          >
            <Text style={s.welcome__backButtonText}>Back to the counters</Text>

            <Image
              style={[s.welcome__arrow, s.welcome__backButtonIcon]}
              source={require('../assets/images/arrow.png')}
            />
          </TouchableOpacity>
        )}

        {firstPickDate && !validDate && (
          <Text style={s.welcome__error}>You have to select a date in the future to start the countdown.</Text>
        )}

        {firstPickText && !validText && (
          <Text style={s.welcome__error}>You have to choose a name to your countdown.</Text>
        )}

        <View style={s.welcome__form}>
          <Text style={s.welcome__text}>
            Let’s count <Text style={styles(showDate)} onPress={this.togglePicker}>{valueDate}</Text>{breakLine}for <Text style={styles(counterText)} onPress={this.toggleInput}>{valueText}</Text>.
          </Text>

          {(Platform.OS === 'ios') && (
            <Picker
              open={pickerIsShown}
              toggle={this.togglePicker}
              date={counterTo}
              onChange={this.onDateChange}
            />
          )}

          <Input
            open={inputIsShown}
            toggle={this.toggleInput}
            text={counterText}
            placeholder={PLACEHOLDER_TEXT}
            onChange={this.onTextChange}
          />

          <TouchableOpacity
            onPress={this.submit}
            activeOpacity={0.75}
            style={s.welcome__submit}
          >
            <Image
              style={isClickable ? [s.welcome__arrow, s.welcome__iconActive] : [s.welcome__arrow, s.welcome__icon]}
              source={require('../assets/images/submit.png')}
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
    marginTop: 200,
  },

  welcome__text: {
    paddingVertical: isIpad() ? 20 : 0,
    marginLeft: 30,
    marginRight: 30,

    ...fonts.medium,
    fontSize: isIpad() ? 48 : 32,
    color: '#333',
    lineHeight: Platform.select({ ios: undefined, android: 46 }),
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
    alignSelf: 'flex-start',

    marginLeft: 24,
    marginTop: 60,
  },

  welcome__image: {
    width: isIpad() ? 62 : 52,
    height: isIpad() ? 62 : 52,
  },

  welcome__icon: {
    tintColor: '#c1ccdb',
  },

  welcome__iconActive: {
    tintColor: '#6ef09f',
  },

  welcome__backButton: {
    flexDirection: 'row',
    alignItems: 'center',

    position: 'absolute',
    top: 40,
    left: 30,

    paddingRight: 80,
  },

  welcome__backButtonText: {
    ...fonts.medium,
    fontSize: 15,
    color: '#a2abb8',
  },

  welcome__backButtonIcon: {
    top: Platform.select({ ios: -2, android: 1 }),

    width: 10,
    height: 5,
  },

  welcome__error: {
    position: 'absolute',
    top: 40,
    left: 30,

    paddingRight: 80,

    ...fonts.medium,
    fontSize: 15,
    color: '#a2abb8',
  },

  welcome__arrow: {
    marginLeft: 6,

    tintColor: '#a2abb8',
  },

  welcome__footer: {
    paddingHorizontal: 30,
    marginTop: 'auto',
    marginBottom: 30,

    ...fonts.medium,
    fontSize: isIpad() ? 18 : 15,
    color: '#c1ccdb',
  },

  welcome__link: {
    color: '#a2abb8',
  },
});

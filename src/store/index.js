import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { AsyncStorage } from 'react-native';
import { Provider } from 'mobx-react/native';
import { create, persist } from 'mobx-persist';

import UI from './UI';

const hydrate = create({
  storage: AsyncStorage,
  jsonify: true,
});

export default class Store {

  @persist('object', UI)
  ui = new UI();

  async init() {
    await hydrate('store', this.ui);

    const lastOpened = new Date();

    this.ui.counters.forEach((c, k) =>
      this.ui.updateStatus(k, {
        lastClosed: this.ui.lastClosed,
        lastOpened,
        remaining: c.status.total,
      }),
    );

    return true;
  }
}

export class StoreProvider extends PureComponent {

  static propTypes = {
    store: PropTypes.object,
    children: PropTypes.node,
  };

  static defaultProps = {
    store: {},
    children: undefined,
  };

  render() {
    const { store, children } = this.props;

    return (
      <Provider ui={store.ui}>
        {children}
      </Provider>
    );
  }
}

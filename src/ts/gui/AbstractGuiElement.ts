import * as $ from 'jquery';
import { ReactElement } from 'react';
import ReactDOM = require('react-dom');
import { NetworkListener } from '../networking/NetworkListener';

export abstract class AbstractGuiElement extends NetworkListener {
  root: HTMLDivElement;

  constructor($container: JQuery, react: ReactElement) {
    super();
    this.root = document.createElement("div");
    ReactDOM.render(react, this.root);
    $container.append(this.root);
  }
}
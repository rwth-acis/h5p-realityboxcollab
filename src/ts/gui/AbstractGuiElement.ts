import * as $ from 'jquery';
import { ReactElement } from 'react';
import ReactDOM = require('react-dom');
import { NetworkListener } from '../networking/NetworkListener';

export abstract class AbstractGuiElement extends NetworkListener {
  root: HTMLDivElement;

  constructor(private container: JQuery) {
    super();
  }

  init() { // Not in constructor to ensure class fields are loaded for extending classes
    this.root = document.createElement("div");
    this.updateView();
  }

  updateView() {
    ReactDOM.render(this.createElement(), this.root);
    this.container.append(this.root);
  }

  abstract createElement(): ReactElement
}
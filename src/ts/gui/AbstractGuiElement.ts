import * as $ from 'jquery';
import { ReactElement } from 'react';
import ReactDOM = require('react-dom');
import { NetworkListener } from '../networking/NetworkListener';

/**
 * This class represents a Gui Element such as the chat. It will be initialized by the main RealityboxCollab instance.
 */
export abstract class AbstractGuiElement extends NetworkListener {
  root: HTMLDivElement;

  /**
   * Construct a GuiElement. The element can be initialized using the {@link AbstractGuiElement.init}
   * 
   * @param container The {@link JQuery} container on which this GuiElement will itself attach on
   */
  constructor(private container: JQuery) {
    super();
  }

  /**
   * Initialize this GuiElement and attach to the container given in the constructor. This method will not call {@link AbstractGuiElement.updateView} by itself.
   */
  init() { // Not in constructor to ensure class fields are loaded for extending classes
    this.root = document.createElement("div");
    this.container.append(this.root);
  }

  /**
   * Update this GuiElement by calling {@link AbstractGuiElement.createElement} and then re-rendering the view.
   */
  updateView() {
    ReactDOM.render(this.createElement(), this.root);
  }

  /**
   * Called by the {@link AbstractGuiElement} when an update of the view is request by the
   * {@link AbstractGuiElement.updateView} or {@link AbstractGuiElement.init} method
   * 
   * @returns The ReactElement for this view
   */
  abstract createElement(): ReactElement
}
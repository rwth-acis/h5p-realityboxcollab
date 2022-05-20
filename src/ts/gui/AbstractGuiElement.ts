import * as $ from 'jquery';
import { NetworkListener } from '../networking/NetworkListener';
import { Room } from '../networking/Room';

export abstract class AbstractGuiElement extends NetworkListener {
  element: JQuery;
  container: JQuery;

  constructor($container: JQuery, html: string) {
    super();
    this.element = $(html).appendTo($container);
    this.container = $container;
  }
}
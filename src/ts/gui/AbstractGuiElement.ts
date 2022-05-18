import * as $ from 'jquery';

export abstract class AbstractGuiElement {
    element: JQuery;
    container: JQuery;

    constructor($container: JQuery, html: string) {
        this.element = $(html).appendTo($container);
        this.container = $container;
      }
}
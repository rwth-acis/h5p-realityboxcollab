import React = require('react');
import { AbstractGuiElement } from './AbstractGuiElement';

export class Settings extends AbstractGuiElement {

  constructor(container: JQuery) {
    super(container,
      <div id='collabSettings' className='guiElement'>
        <h1>Settings</h1>
      </div>
    );
  }

  onRoomChanged(): void {

  }
}
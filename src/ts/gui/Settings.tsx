import { ReactElement } from 'react';
import React = require('react');
import { AbstractGuiElement } from './AbstractGuiElement';

export class Settings extends AbstractGuiElement {

  constructor(container: JQuery) {
    super(container);
  }

  createElement(): ReactElement {
    return <div id='collabSettings' className='guiElement'>
      <h1 className='elementHeading'>Settings</h1>
    </div>
  }

  onRoomChanged(): void {

  }
}
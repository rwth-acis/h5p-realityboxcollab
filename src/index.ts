import * as $ from 'jquery'; // Needed for JQuery to be loaded
import './css/material-icons/material-icons.css';
import './css/realitybox.css';
import './css/realitybox-collab.scss';
import { RealityBoxCollab } from './ts/RealityboxCollab';

declare let H5P: any;
H5P = H5P || {};

H5P.RealityBoxCollab = class extends H5P.ContentType(true) {

  collab: RealityBoxCollab;

  constructor(options: any, id: any) {
    super();
    this.collab = new RealityBoxCollab(options, id);
  }

  async attach($container: JQuery) {
    this.collab.attach($container);
  }

}
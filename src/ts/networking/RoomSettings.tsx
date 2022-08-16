import React = require('react');
import { ReactNode } from 'react';
import { Room } from './Room';

/**
 * Types of {@link SettingsGuiElement}s
 */
export enum SettingsType {
    Checkbox, Heading
}

/**
 * This class is not generic to avoid casting, since no method would profit from having generics
 */
export class SettingsGuiElement {

    constructor(public name: string, public type: SettingsType, public getter?: (s: RoomSettings) => any, public setter?: (s: RoomSettings, value: any) => void) { }

    createElement(room: Room): ReactNode {
        return <>
            {
                this.type == SettingsType.Heading &&
                <h4>{this.name}</h4>
            }
            {
                this.type == SettingsType.Checkbox &&
                <div>
                    <label>
                        <input type="checkbox" checked={this.getter(room.roomInfo.settings) as boolean} onChange={() => { this.setter(room.roomInfo.settings, !(this.getter(room.roomInfo.settings) as boolean)); room.onSettingsUpdated(); }} />
                        &nbsp;&nbsp;{this.name}
                    </label>
                </div>
            }
        </>;
    }
}

/**
 * This type represents the settings which a room holds
 */
export interface RoomSettings {
    canUseChat: boolean;
    canUseMoveTool: boolean; // Currently not set able
    canUsePointerTool: boolean;
    canUseAnnotationTool: boolean;
    canUsePenTool: boolean;
    annotationEnabled: boolean;
    onlySeeHosts: boolean;
}

/**
 * The default settings used for a new room
 */
export const DEFAULT_SETTINGS: RoomSettings = {
    canUseChat: true,
    canUseMoveTool: true,
    canUsePointerTool: true,
    canUseAnnotationTool: true,
    canUsePenTool: true,
    annotationEnabled: true,
    onlySeeHosts: false
}

/**
 * The settings as gui elements with their callbacks to get / update the current value
 */
export const SETTINGS: SettingsGuiElement[] = [
    new SettingsGuiElement("Show Annotations", SettingsType.Checkbox, s => s.annotationEnabled, (s, v) => s.annotationEnabled = v),
    new SettingsGuiElement("Hide non-host users", SettingsType.Checkbox, s => s.onlySeeHosts, (s, v) => s.onlySeeHosts = v),
    new SettingsGuiElement("Users can use...", SettingsType.Heading),
    new SettingsGuiElement("Chat", SettingsType.Checkbox, s => s.canUseChat, (s, v) => s.canUseChat = v),
    new SettingsGuiElement("Pointer Tool", SettingsType.Checkbox, s => s.canUsePointerTool, (s, v) => s.canUsePointerTool = v),
    new SettingsGuiElement("Annotation Tool", SettingsType.Checkbox, s => s.canUseAnnotationTool, (s, v) => s.canUseAnnotationTool = v),
    new SettingsGuiElement("Pen Tool", SettingsType.Checkbox, s => s.canUsePenTool, (s, v) => s.canUsePenTool = v) 
]
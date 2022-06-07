export interface RoomSettings {
    canUseChat: boolean;
}

export enum SettingsType {
    Checkbox, Heading
  }
  
  export interface SettingsGuiElement {
    name: string,
    type: SettingsType,
    property?: (s: RoomSettings) => any,
    toggle?: (s: RoomSettings) => any
  }
  
  export const SETTINGS: SettingsGuiElement[] = [
    { name: "Users can...", type: SettingsType.Heading },
    { name: "use the Chat", property: s => s.canUseChat, toggle: s => s.canUseChat = !s.canUseChat, type: SettingsType.Checkbox }
  ]
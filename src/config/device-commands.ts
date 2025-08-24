import type { DeviceCommandDefinition, DeviceCommandType, Device } from "../types";
import { hasCapability, type DeviceCapabilities } from "./device-capabilities";

export const DEVICE_COMMANDS: DeviceCommandDefinition[] = [
  {
    id: "power-toggle",
    title: "Toggle Power",
    subtitle: "Turn device on/off",
    icon: "power",
    command: "toggle",
    description: "Toggle the power state of the device",
    requiredCapability: "power",
  },
  {
    id: "speed-up",
    title: "Increase Speed",
    subtitle: "Increase fan speed by 1 level",
    icon: "plus",
    command: "speed_up",
    description: "Increase the fan speed by one level",
    requiredCapability: "speed",
  },
  {
    id: "speed-down",
    title: "Decrease Speed",
    subtitle: "Decrease fan speed by 1 level",
    icon: "minus",
    command: "speed_down",
    description: "Decrease the fan speed by one level",
    requiredCapability: "speed",
  },
  {
    id: "set-speed",
    title: "Set Speed Level",
    subtitle: "Set specific fan speed (1-5)",
    icon: "gauge",
    command: "set_speed",
    description: "Set the fan to a specific speed level",
    requiredCapability: "speed",
    parameters: {
      speed_level: {
        type: "number",
        min: 1,
        max: 6,
        required: true,
      },
    },
  },
  {
    id: "sleep-mode",
    title: "Toggle Sleep Mode",
    subtitle: "Activate/deactivate sleep mode",
    icon: "moon",
    command: "sleep_mode",
    description: "Toggle sleep mode for quieter operation",
    requiredCapability: "sleep",
  },
  {
    id: "led-toggle",
    title: "Toggle LED",
    subtitle: "Turn LED indicators on/off",
    icon: "lightbulb",
    command: "led_toggle",
    description: "Toggle the LED indicators on the device",
    requiredCapability: "led",
  },
  {
    id: "timer-1h",
    title: "Set 1 Hour Timer",
    subtitle: "Auto turn off after 1 hour",
    icon: "clock",
    command: "timer_1h",
    description: "Set device to automatically turn off after 1 hour",
    requiredCapability: "timer",
  },
  {
    id: "timer-2h",
    title: "Set 2 Hour Timer",
    subtitle: "Auto turn off after 2 hours",
    icon: "clock",
    command: "timer_2h",
    description: "Set device to automatically turn off after 2 hours",
    requiredCapability: "timer",
  },
  {
    id: "timer-3h",
    title: "Set 3 Hour Timer",
    subtitle: "Auto turn off after 3 hours",
    icon: "clock",
    command: "timer_3h",
    description: "Set device to automatically turn off after 3 hours",
    requiredCapability: "timer",
  },
  {
    id: "timer-6h",
    title: "Set 6 Hour Timer",
    subtitle: "Auto turn off after 6 hours",
    icon: "clock",
    command: "timer_6h",
    description: "Set device to automatically turn off after 6 hours",
    requiredCapability: "timer",
  },
  {
    id: "set-timer",
    title: "Set Custom Timer",
    subtitle: "Set timer for specific hours",
    icon: "timer",
    command: "set_timer",
    description: "Set device to automatically turn off after specified hours",
    requiredCapability: "timer",
    parameters: {
      timer_hours: {
        type: "number",
        min: 0,
        max: 4,
        required: true,
      },
    },
  },
  {
    id: "timer-off",
    title: "Cancel Timer",
    subtitle: "Remove any active timer",
    icon: "xmarkcircle",
    command: "timer_off",
    description: "Cancel any currently active timer",
    requiredCapability: "timer",
  },
  {
    id: "brightness-up",
    title: "Increase Brightness",
    subtitle: "Increase LED brightness by 10%",
    icon: "sun",
    command: "brightness_up",
    description: "Increase the LED brightness by 10%",
    requiredCapability: "brightness",
  },
  {
    id: "brightness-down",
    title: "Decrease Brightness",
    subtitle: "Decrease LED brightness by 10%",
    icon: "sun",
    command: "brightness_down",
    description: "Decrease the LED brightness by 10%",
    requiredCapability: "brightness",
  },
  {
    id: "set-brightness",
    title: "Set Brightness",
    subtitle: "Set LED brightness level (10-100)",
    icon: "sun",
    command: "set_brightness",
    description: "Set the LED brightness to a specific level",
    requiredCapability: "brightness",
    parameters: {
      brightness_level: {
        type: "number",
        min: 10,
        max: 100,
        required: true,
      },
    },
  },
  {
    id: "set-brightness-delta",
    title: "Adjust Brightness",
    subtitle: "Adjust LED brightness by specific amount",
    icon: "sun",
    command: "set_brightness_delta",
    description: "Adjust the LED brightness by a specific delta value",
    requiredCapability: "brightness",
    parameters: {
      brightness_delta: {
        type: "number",
        min: -90,
        max: 90,
        required: true,
      },
    },
  },
  {
    id: "set-color",
    title: "Set LED Color",
    subtitle: "Change LED indicator color",
    icon: "palette",
    command: "set_color",
    description: "Set the LED color for device indicators",
    requiredCapability: "color",
    parameters: {
      color: {
        type: "string",
        options: ["warm", "cool", "daylight"],
        required: true,
      },
    },
  },
];

export const getCommandById = (id: string): DeviceCommandDefinition | undefined => {
  return DEVICE_COMMANDS.find((cmd) => cmd.id === id);
};

export const getCommandsByType = (commandType: DeviceCommandType): DeviceCommandDefinition[] => {
  return DEVICE_COMMANDS.filter((cmd) => cmd.command === commandType);
};

export const getSimpleCommands = (): DeviceCommandDefinition[] => {
  return DEVICE_COMMANDS.filter((cmd) => !cmd.parameters);
};

export const getParametrizedCommands = (): DeviceCommandDefinition[] => {
  return DEVICE_COMMANDS.filter((cmd) => cmd.parameters);
};

export const getAvailableCommandsForDevice = (device: Device): DeviceCommandDefinition[] => {
  return DEVICE_COMMANDS.filter((cmd) => {
    if (!cmd.requiredCapability) return true;
    return hasCapability(device, cmd.requiredCapability as keyof DeviceCapabilities);
  });
};

export const isCommandAvailableForDevice = (device: Device, commandId: string): boolean => {
  const command = getCommandById(commandId);
  if (!command || !command.requiredCapability) return true;
  return hasCapability(device, command.requiredCapability as keyof DeviceCapabilities);
};

import { Icon } from "@raycast/api";

export const iconMap: Record<string, Icon> = {
  power: Icon.Power,
  plus: Icon.Plus,
  minus: Icon.Minus,
  gauge: Icon.Gauge,
  repeat: Icon.Repeat,
  moon: Icon.Moon,
  lightbulb: Icon.LightBulb,
  clock: Icon.Clock,
  timer: Icon.Timer,
  xmarkcircle: Icon.XMarkCircle,
  sun: Icon.Sun,
  palette: Icon.Palette,
};

export const getIconFromString = (iconString: string): Icon => {
  return iconMap[iconString] || Icon.Dot;
};

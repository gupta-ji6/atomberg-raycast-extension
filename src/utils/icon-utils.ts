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
  timer: Icon.Clock,
  xmarkcircle: Icon.XMarkCircle,
  sun: Icon.Sun,
  palette: Icon.Circle,
};

export const getIconFromString = (iconString: string): Icon => {
  return iconMap[iconString] || Icon.Dot;
};

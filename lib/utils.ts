import { BREAKPOINTS } from "@/components/grid-systems/const";
import { clsx, type ClassValue } from "clsx";
import _ from "lodash";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDeviceType() {
  if (typeof window !== "undefined") {
    const width = window.innerWidth;
    if (width >= 1024) {
      return "desktop";
    } else {
      return "mobile";
    }
  }
  return "desktop";
}

export function getDeviceSize() {
  if (typeof window !== "undefined") {
    const width = window.innerWidth;
    const result = _.find(
      BREAKPOINTS,
      (b) => width >= b.minWidth && width <= b.maxWidth
    );
    return result?.style;
  }
  return BREAKPOINTS.laptop.style; // Giá trị mặc định nếu window không tồn tại (SSR)
}

import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// clsx - аналог библиотеки classNames, только облегчённый вариант
// используется для условного применения CSS стилей
//
// twMerge - удаляет из поля `className` дублирующиеся стили
// То есть стили "text-red-400 text-xl text-lg" превратится в "text-red-400 text-lg"
//
// Это позволяет задать базовые стили для компонента,
// и дальше пробрасывать доп. стили через пропсы и не бояться коллизий
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

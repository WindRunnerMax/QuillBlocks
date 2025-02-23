import { IconMoon, IconSun } from "@arco-design/web-react/icon";
import { Storage } from "block-kit-utils";
import type { FC } from "react";
import { useEffect, useState } from "react";

import { MagicIcon } from "../icons/magic";

const STORAGE_KEY = "theme-index";
const darkThemeMatch = window.matchMedia("(prefers-color-scheme: dark)");
const list = [MagicIcon, <IconSun />, <IconMoon />];

const handler = (e: MediaQueryListEvent) => {
  if (e.matches) document.body.setAttribute("arco-theme", "dark");
  else document.body.removeAttribute("arco-theme");
};

export const ThemeMode: FC = () => {
  const [index, setIndex] = useState(Storage.local.get<number>(STORAGE_KEY) || 0);

  useEffect(() => {
    switch (index) {
      case 0: {
        if (darkThemeMatch.matches) document.body.setAttribute("arco-theme", "dark");
        else document.body.removeAttribute("arco-theme");
        darkThemeMatch.onchange = handler;
        break;
      }
      case 1: {
        darkThemeMatch.onchange = null;
        document.body.removeAttribute("arco-theme");
        break;
      }
      case 2: {
        darkThemeMatch.onchange = null;
        document.body.setAttribute("arco-theme", "dark");
        break;
      }
    }
  }, [index]);

  const onClick = () => {
    const nextIndex = (index + 1) % list.length;
    setIndex(nextIndex);
    Storage.local.set(STORAGE_KEY, nextIndex);
  };

  return (
    <div className="menu-toolbar-item" onClick={onClick}>
      {list[index]}
    </div>
  );
};

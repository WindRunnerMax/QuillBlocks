import "../styles/font-color.scss";

import { Trigger } from "@arco-design/web-react";
import { IconDown } from "@arco-design/web-react/icon";
import { cs } from "block-kit-utils";
import type { FC } from "react";

import { BACKGROUND_KEY } from "../../background/types";
import { FONT_COLOR_KEY } from "../../font-color/types";
import { FontColorIcon } from "../../shared/icons/font-color";
import { useToolbarContext } from "../context/provider";

const COLOR = [
  "",
  "rgb(143, 149, 158)",
  "rgb(216, 57, 49)",
  "rgb(222, 120, 2)",
  "rgb(220, 155, 4)",
  "rgb(46, 161, 33)",
  "rgb(36, 91, 219)",
  "rgb(100, 37, 208)",
];

const BACKGROUND = [
  "",
  "rgb(242, 243, 245)",
  "rgb(251, 191, 188)",
  "rgba(254, 212, 164, 0.8)",
  "rgba(255, 246, 122, 0.8)",
  "rgba(183, 237, 177, 0.8)",
  "rgba(186, 206, 253, 0.7)",
  "rgba(205, 178, 250, 0.7)",
  "rgba(222, 224, 227, 0.8)",
  "rgb(187, 191, 196)",
  "rgb(247, 105, 100)",
  "rgb(255, 165, 61)",
  "rgb(255, 233, 40)",
  "rgb(98, 210, 86)",
  "rgba(78, 131, 253, 0.55)",
  "rgba(147, 90, 246, 0.55)",
];

export const FontColor: FC = () => {
  const { keys, refreshMarks, editor } = useToolbarContext();

  return (
    <Trigger
      trigger="click"
      popup={() => (
        <div className="block-kit-toolbar-dropdown block-kit-color-picker" onClick={refreshMarks}>
          <div className="kit-color-picker-label">字体颜色</div>
          <div className="kit-picker-group">
            {COLOR.map(it => (
              <div
                className={cs(
                  "kit-picker-item-wrapper",
                  keys[FONT_COLOR_KEY] === it && "active",
                  !keys[FONT_COLOR_KEY] && !it && "active"
                )}
                key={it}
                style={{ color: it ? it : void 0 }}
                onClick={() => {
                  editor.command.exec(FONT_COLOR_KEY, { value: it });
                  refreshMarks();
                }}
              >
                <div className="kit-picker-item">
                  <FontColorIcon></FontColorIcon>
                </div>
              </div>
            ))}
          </div>
          <div className="kit-color-picker-label">背景颜色</div>
          <div className="kit-picker-group kit-picker-background-case">
            {BACKGROUND.map(it => (
              <div
                className={cs(
                  "kit-picker-item-wrapper",
                  keys[BACKGROUND_KEY] === it && "active",
                  !keys[BACKGROUND_KEY] && !it && "active"
                )}
                key={it}
                onClick={() => {
                  editor.command.exec(BACKGROUND_KEY, { value: it });
                  refreshMarks();
                }}
              >
                <div
                  style={{ background: it ? it : void 0 }}
                  className={cs("kit-picker-item", !it && "kit-picker-item-empty-background")}
                ></div>
              </div>
            ))}
          </div>
        </div>
      )}
    >
      <div className="menu-toolbar-item kit-color-case">
        <div
          className="kit-color-block"
          style={{ color: keys[FONT_COLOR_KEY], background: keys[BACKGROUND_KEY] }}
        >
          <FontColorIcon></FontColorIcon>
        </div>
        <IconDown className="menu-toolbar-icon-down" />
      </div>
    </Trigger>
  );
};

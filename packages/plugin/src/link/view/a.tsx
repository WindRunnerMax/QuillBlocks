import "../styles/index.scss";

import type { AttributeMap } from "block-kit-delta";
import { useReadonly } from "block-kit-react";
import { CTRL_KEY } from "block-kit-utils";
import type { FC } from "react";

import { LINK_BLANK_KEY, LINK_KEY } from "../types";

export const A: FC<{
  attrs: AttributeMap;
}> = props => {
  const { attrs } = props;
  const { readonly } = useReadonly();

  const href = attrs[LINK_KEY];
  const target = attrs[LINK_BLANK_KEY] ? "_blank" : "_self";

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e[CTRL_KEY] && window.open(href, "_blank");
    e.preventDefault();
  };

  return (
    <a
      href={href}
      target={target}
      rel="noreferrer"
      className="block-kit-hyper-link"
      onClick={readonly ? void 0 : onClick}
    >
      {props.children}
    </a>
  );
};

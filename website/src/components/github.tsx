import { IconGithub } from "@arco-design/web-react/icon";
import type { FC } from "react";

export const GitHubIcon: FC = () => {
  return (
    <div
      className="menu-toolbar-item"
      onClick={() => window.open("https://github.com/WindRunnerMax/BlockKit")}
    >
      <IconGithub />
    </div>
  );
};

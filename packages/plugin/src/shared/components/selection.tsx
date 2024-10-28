import "../styles/selection.scss";

import type { LeafState } from "block-kit-core";
import type { Editor } from "block-kit-core";
import { Range } from "block-kit-core";
import { cs, getId } from "block-kit-utils";
import React from "react";

import type { SelectionPlugin } from "../modules/selection";

type Props = {
  leaf: LeafState;
  border?: boolean;
  className?: string;
  selection: SelectionPlugin;
};

type State = {
  id: string;
  selected: boolean;
};

export class SelectionHOC extends React.PureComponent<Props, State> {
  private editor: Editor;

  constructor(props: Props) {
    super(props);
    this.state = {
      id: getId(),
      selected: false,
    };
    this.editor = this.props.selection.editor;
  }

  public componentDidMount(): void {
    // FIX: UNDO 时内容与选区变化同样需要更新状态
    const range = this.editor.selection.get();
    this.onSelectionChange(range);
    this.props.selection.mountView(this.state.id, this);
  }

  public componentWillUnmount(): void {
    this.props.selection.unmountView(this.state.id);
  }

  public onSelectionChange(range: Range | null) {
    const leaf = this.props.leaf;
    const leafRange = leaf.toRange();
    const nextState = range ? Range.intersection(leafRange, range) : false;
    if (this.state.selected !== nextState) {
      this.setState({ selected: nextState });
    }
  }

  public render() {
    const selected = this.state.selected;
    const { border = true } = this.props;
    if (this.props.selection.readonly) {
      return this.props.children;
    }
    return (
      <div
        className={cs(this.props.className, selected && border && "doc-block-selected")}
        data-selection
      >
        {React.Children.map(this.props.children, child => {
          if (React.isValidElement(child)) {
            const { props } = child;
            return React.cloneElement(child, { ...props, selected: selected });
          } else {
            return child;
          }
        })}
      </div>
    );
  }
}

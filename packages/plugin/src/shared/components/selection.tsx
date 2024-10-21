import "../styles/selection.scss";

import type { LeafState } from "block-kit-core";
import { Range } from "block-kit-core";
import { cs, getId } from "block-kit-utils";
import React from "react";

import type { SelectionPlugin } from "../modules/selection";

type Props = {
  leaf: LeafState;
  className?: string;
  selection: SelectionPlugin;
};

type State = {
  id: string;
  selected: boolean;
};

export class SelectionHOC extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      id: getId(),
      selected: false,
    };
  }

  public componentDidMount(): void {
    this.props.selection.mountView(this.state.id, this);
  }

  public componentWillUnmount(): void {
    this.props.selection.unmountView(this.state.id);
  }

  public onSelectionChange(range: Range | null) {
    const leaf = this.props.leaf;
    const nextState = range ? Range.intersection(leaf.toRange(), range) : false;
    if (this.state.selected !== nextState) {
      this.setState({ selected: nextState });
    }
  }

  public render() {
    const selected = this.state.selected;
    if (this.props.selection.readonly) {
      return this.props.children;
    }
    return (
      <div className={cs(this.props.className, selected && "doc-block-selected")} data-selection>
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

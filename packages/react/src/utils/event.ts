export const preventNativeEvent = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
};

export const preventReactEvent = (e: React.SyntheticEvent) => {
  preventNativeEvent(e.nativeEvent);
};

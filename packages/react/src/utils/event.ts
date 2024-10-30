export const stopNativeEvent = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
};

export const stopReactEvent = (e: React.SyntheticEvent) => {
  stopNativeEvent(e.nativeEvent);
};

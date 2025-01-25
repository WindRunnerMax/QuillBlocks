export const preventNativeEvent = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
};

export const stopReactEvent = (e: React.SyntheticEvent) => {
  preventNativeEvent(e.nativeEvent);
};

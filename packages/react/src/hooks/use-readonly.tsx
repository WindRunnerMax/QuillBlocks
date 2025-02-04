import React, { createContext } from "react";

export const ReadonlyContext = createContext<boolean>(false);

export const useReadonly = () => {
  const readonly = React.useContext(ReadonlyContext);
  return { readonly };
};

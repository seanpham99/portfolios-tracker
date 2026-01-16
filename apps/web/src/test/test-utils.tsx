import "@testing-library/jest-dom";
import { render as rtlRender, RenderOptions, RenderResult } from "@testing-library/react";
import { ReactElement, ReactNode } from "react";

export const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">): RenderResult =>
  rtlRender(ui, {
    wrapper: AllTheProviders,
    ...options,
  });

export * from "@testing-library/react";
export { customRender as render };
export { default as userEvent } from "@testing-library/user-event";

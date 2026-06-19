import type { TemplateProps } from "./index";

export function BlankTemplate({ children }: TemplateProps) {
  return (
    <div className="flex flex-col justify-center pl-16 lg:pl-24 h-full w-full">
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
}

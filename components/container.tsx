import type { ComponentPropsWithoutRef, ElementType } from "react";

type ContainerElement =
  | "div"
  | "section"
  | "main"
  | "header"
  | "footer"
  | "nav"
  | "article";

type ContainerSize = "content" | "narrow";

type ContainerProps<T extends ContainerElement> = {
  as?: T;
  size?: ContainerSize;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "size" | "className">;

const sizeClasses: Record<ContainerSize, string> = {
  content: "max-w-content",
  narrow: "max-w-narrow",
};

export default function Container<T extends ContainerElement = "div">({
  as,
  size = "content",
  className,
  ...rest
}: ContainerProps<T>) {
  const Tag: ElementType = as ?? "div";
  const classes = `mx-auto w-full px-gutter ${sizeClasses[size]}${
    className ? ` ${className}` : ""
  }`;

  return <Tag className={classes} {...rest} />;
}

export { default as Header } from "./Header";
export { default as Footer } from "./Footer";
export { default as Layout } from "./Layout";
export { default as LoginModal } from "./LoginModal";
export { default as ConfirmModal } from "./ConfirmModal";
export { default as Providers } from "./Providers";
export { default as GameCard } from "./GameCard";
export { default as GameCardDev } from "./GameCardDev";
export { default as Pagination } from "./Pagination";
export { default as Breadcrumb } from "./Breadcrumb";
export type { BreadcrumbItem, BreadcrumbProps } from "./Breadcrumb";

import * as BsIcons from "react-icons/bs";
import * as Fa6Icons from "react-icons/fa6";
import * as FcIcons from "react-icons/fc";
import * as TbIcons from "react-icons/tb";
import * as SiIcons from "react-icons/si";

export const Icons = {
  ...BsIcons,
  ...Fa6Icons,
  ...FcIcons,
  ...TbIcons,
  ...SiIcons,
};

export { DotLottieReact } from '@lottiefiles/dotlottie-react';
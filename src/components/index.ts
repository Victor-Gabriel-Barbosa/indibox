// Exporta componentes
export { default as Header } from "./Header";
export { default as Footer } from "./Footer";
export { default as Layout } from "./Layout";
export { default as LoginModal } from "./LoginModal";
export { default as ConfirmModal } from "./ConfirmModal";
export { default as GameCard } from "./CardJogo";
export { default as GameCardDev } from "./CardJogoDev";
export { default as Pagination } from "./Paginacao";
export { default as Breadcrumb } from "./Breadcrumb";
export { default as UploadArquivo } from "./UploadArquivo";
export { default as SeletorArquivo } from "./SeletorArquivo";
export { default as SeletorScreenshots } from "./SeletorScreenshots";
export { default as AvaliacaoJogo } from "./AvaliacaoJogo";
export type { BreadcrumbItem, BreadcrumbProps } from "./Breadcrumb";

// Importa ícones da biblioteca do React
import * as BsIcons from "react-icons/bs";
import * as Fa6Icons from "react-icons/fa6";
import * as FcIcons from "react-icons/fc";
import * as TbIcons from "react-icons/tb";
import * as SiIcons from "react-icons/si";
import * as BiIcons from "react-icons/bi";
import * as IoIcons from "react-icons/io";

// Exporta os ícones
export const Icons = {
  ...BsIcons,
  ...Fa6Icons,
  ...FcIcons,
  ...TbIcons,
  ...SiIcons,
  ...BiIcons,
  ...IoIcons
};

// Exporta o componente DotLottieReact para animações Lottie
export { DotLottieReact } from '@lottiefiles/dotlottie-react';
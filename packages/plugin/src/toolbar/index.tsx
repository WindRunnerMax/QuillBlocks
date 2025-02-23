import { Align } from "./modules/align";
import { Bold } from "./modules/bold";
import { BulletList } from "./modules/bullet-list";
import { Cut } from "./modules/cut";
import { Divider } from "./modules/divider";
import { FontColor } from "./modules/font-color";
import { FontSize } from "./modules/font-size";
import { Heading } from "./modules/heading";
import { History } from "./modules/history";
import { Image } from "./modules/image";
import { InlineCode } from "./modules/inline-code";
import { Italic } from "./modules/italic";
import { LineHeight } from "./modules/line-height";
import { Link } from "./modules/link";
import { OrderList } from "./modules/order-list";
import { Quote } from "./modules/quote";
import { Strike } from "./modules/strike";
import { Underline } from "./modules/underline";

export { FloatToolbar } from "./context/float";
export { Toolbar } from "./context/provider";

export const Mixin = {
  Cut,
  Bold,
  Link,
  Quote,
  Image,
  Align,
  Italic,
  Strike,
  History,
  Heading,
  Divider,
  FontSize,
  FontColor,
  OrderList,
  Underline,
  BulletList,
  InlineCode,
  LineHeight,
};

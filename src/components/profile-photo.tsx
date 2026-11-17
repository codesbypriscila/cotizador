import Image from "next/image";
import photo from "../../public/images/priscila.jpg";
import { cx } from "./ui";

/**
 * Small round profile photo (same one as the About me section of the portfolio).
 * View only: no link, no zoom, no drag, no context menu target.
 */
export function ProfilePhoto({ size, className, priority }: { size: number; className?: string; priority?: boolean }) {
  return (
    <span className={cx("block shrink-0 overflow-hidden rounded-full bg-chip", className)} style={{ width: size, height: size }}>
      <Image
        src={photo}
        alt="Priscila Pérez"
        width={size}
        height={size}
        sizes={`${size}px`}
        quality={85}
        priority={priority}
        draggable={false}
        className="pointer-events-none size-full object-cover select-none"
      />
    </span>
  );
}

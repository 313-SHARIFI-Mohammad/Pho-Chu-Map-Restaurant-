import { Image } from "lucide-react";

export default function SafeImage({
  src,
  alt = "",
  className,
  iconClassName = "h-8 w-8",
  ...imgProps
}) {
  if (!src) {
    return (
      <div className={className} role="img" aria-label={alt}>
        <Image
          className={`text-white/30 ${iconClassName}`}
          aria-hidden="true"
        />
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} {...imgProps} />;
}
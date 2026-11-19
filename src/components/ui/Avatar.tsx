import { fileUrl, initials } from "@/lib/utils";

export function Avatar({
  name,
  photoId,
  size = 40,
  color = "#10b981",
  className = "",
}: {
  name: string;
  photoId?: string | null;
  size?: number;
  color?: string;
  className?: string;
}) {
  const url = fileUrl(photoId);
  if (url)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        className={`shrink-0 rounded-full object-cover ring-2 ring-white ${className}`}
        style={{ width: size, height: size }}
      />
    );
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white ${className}`}
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </div>
  );
}

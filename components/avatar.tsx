"use client";
import Image from "next/image";
import { useState } from "react";
export function Avatar({
  name,
  image,
  size = 56,
}: {
  name: string;
  image?: string | null;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.3 }}
    >
      {image && !failed ? (
        <Image
          src={image}
          alt=""
          width={size}
          height={size}
          unoptimized
          onError={() => setFailed(true)}
        />
      ) : (
        name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
      )}
    </span>
  );
}

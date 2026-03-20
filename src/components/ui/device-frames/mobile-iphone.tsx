import Image from "next/image";

interface MobileIphoneProps {
  screenshot: string;
  alt: string;
  rotation?: number;
  className?: string;
}

export function MobileIphone({
  screenshot,
  alt,
  rotation = -8,
  className = "",
}: MobileIphoneProps) {
  return (
    <div
      className={`relative w-[100px] h-[205px] sm:w-[120px] sm:h-[246px] lg:w-[140px] lg:h-[287px] ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* iPhone bezel */}
      <div className="absolute inset-0 rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] bg-zinc-900 border-[3px] sm:border-4 border-zinc-700/80 shadow-[0_8px_32px_rgba(0,0,0,0.5)] group-hover:shadow-[0_8px_32px_rgba(57,255,20,0.15)] transition-shadow duration-500">
        {/* Dynamic Island */}
        <div className="absolute top-2 sm:top-2.5 left-1/2 -translate-x-1/2 w-[50px] sm:w-[60px] lg:w-[70px] h-[14px] sm:h-[16px] lg:h-[18px] bg-black rounded-full z-10" />

        {/* Screen area */}
        <div className="absolute inset-[3px] sm:inset-1 rounded-[17px] sm:rounded-[20px] lg:rounded-[24px] overflow-hidden bg-black">
          <Image
            src={screenshot}
            alt={alt}
            fill
            className="object-cover object-top scale-[1.03]"
            sizes="140px"
          />
        </div>
      </div>
    </div>
  );
}

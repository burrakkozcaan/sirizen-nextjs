"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SocialProofMessage {
  text: string;
  highlight: string;
  className?: string;
}

interface AnimatedSocialProofProps {
  messages: SocialProofMessage[];
  interval?: number;
  className?: string;
}

export function AnimatedSocialProof({
  messages,
  interval = 3000,
  className,
}: AnimatedSocialProofProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [messages.length, interval]);

  if (messages.length === 0) return null;

  const currentMessage = messages[currentIndex];
  const parts = currentMessage.text.split(currentMessage.highlight);
  const beforeHighlight = parts[0];
  const afterHighlight = parts.slice(1).join(currentMessage.highlight);

  return (
    <div className={cn("transition-all duration-500", className)}>
      <p className="text-sm">
        {beforeHighlight && <span className="text-muted-foreground">{beforeHighlight}</span>}
        <span className={cn("font-bold", currentMessage.className || "text-primary")}>
          {currentMessage.highlight}
        </span>
        {afterHighlight && <span className="text-muted-foreground">{afterHighlight}</span>}
      </p>
    </div>
  );
}


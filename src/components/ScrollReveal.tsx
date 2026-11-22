"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

export type RevealVariant = "up" | "zoom" | "blur";

interface ScrollRevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number; // In milliseconds
  duration?: number; // In milliseconds (default 320ms)
  className?: string;
  as?: keyof HTMLElementTagNameMap;
}

export default function ScrollReveal({
  children,
  variant = "up",
  delay = 0,
  duration = 320,
  className = "",
  as: Component = "div",
}: ScrollRevealProps) {
  // Always default to visible so content is NEVER trapped at opacity: 0
  const [isVisible, setIsVisible] = useState(true);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Respect reduced motion preference
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      return;
    }

    // Safety fallback timer: guarantee 100% visibility even if observer is bypassed
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true);
    }, 250);

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          clearTimeout(fallbackTimer);
          if (elementRef.current) {
            observer.unobserve(elementRef.current);
          }
        }
      },
      {
        threshold: 0.01,
        rootMargin: "0px 0px 100px 0px", // Generous positive margin: triggers well before scroll reaches element
      }
    );

    const currentElem = elementRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      clearTimeout(fallbackTimer);
      if (currentElem) {
        observer.unobserve(currentElem);
      }
    };
  }, []);

  // Subtle transforms without hiding content: opacity stays at readable 100% or subtle 90%
  // so NO section ever appears as a black void or blank space.
  const getVariantStyles = () => {
    if (isVisible) {
      return "opacity-100 translate-y-0 scale-100 blur-0";
    }

    switch (variant) {
      case "zoom":
        return "opacity-95 scale-[0.985] translate-y-1.5";
      case "blur":
        return "opacity-95 blur-[0.5px] translate-y-1";
      case "up":
      default:
        return "opacity-95 translate-y-2";
    }
  };

  const Tag = Component as unknown as React.ElementType;

  return (
    <Tag
      ref={elementRef}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
      className={`transition-all ease-out transform-gpu will-change-transform ${getVariantStyles()} ${className}`}
    >
      {children}
    </Tag>
  );
}

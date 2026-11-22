"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

export type RevealVariant = "up" | "zoom" | "blur";

interface ScrollRevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number; // In milliseconds
  duration?: number; // In milliseconds (default 350ms)
  className?: string;
  as?: keyof HTMLElementTagNameMap;
}

export default function ScrollReveal({
  children,
  variant = "up",
  delay = 0,
  duration = 380,
  className = "",
  as: Component = "div",
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Respect reduced motion preference
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Trigger once: unobserve immediately so animation never retriggers or flickers
          if (elementRef.current) {
            observer.unobserve(elementRef.current);
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    const currentElem = elementRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      if (currentElem) {
        observer.unobserve(currentElem);
      }
    };
  }, []);

  // Compute transform & filter classes based on variant & visibility
  const getVariantStyles = () => {
    if (isVisible) {
      return "opacity-100 translate-y-0 scale-100 blur-0";
    }

    switch (variant) {
      case "zoom":
        return "opacity-0 scale-[0.97] translate-y-2.5";
      case "blur":
        return "opacity-0 blur-[4px] translate-y-2";
      case "up":
      default:
        return "opacity-0 translate-y-3.5";
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

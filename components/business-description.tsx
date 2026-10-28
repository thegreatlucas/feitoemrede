"use client";

import { useEffect, useId, useRef, useState } from "react";

export function BusinessDescription({ text }: { text: string }) {
  const id = useId();
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const lineHeight = Number.parseFloat(
        getComputedStyle(element).lineHeight,
      );
      setOverflows(element.scrollHeight > lineHeight * 4 + 1);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, [text]);

  return (
    <div className="business-description">
      <p
        ref={ref}
        id={id}
        className={expanded ? undefined : "description-collapsed"}
      >
        {text}
      </p>
      {overflows && (
        <button
          type="button"
          className="description-toggle"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Ver menos" : "Ver descrição completa"}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
            style={{ transform: expanded ? "rotate(180deg)" : undefined }}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}

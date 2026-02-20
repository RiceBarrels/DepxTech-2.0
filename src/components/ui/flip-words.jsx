"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export const FlipWords = ({
  words,
  duration = 3000,
  className
}) => {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef(null);

  const startAnimation = useCallback(() => {
    const word = words[words.indexOf(currentWord) + 1] || words[0];
    setCurrentWord(word);
    setIsAnimating(true);
  }, [currentWord, words]);

  useEffect(() => {
    if (!isAnimating) {
      timerRef.current = setTimeout(() => {
        startAnimation();
      }, duration);
    }
    return () => clearTimeout(timerRef.current);
  }, [isAnimating, duration, startAnimation]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        setIsAnimating(false);
      }}>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        exit={{ opacity: 0, y: -20, position: "absolute" }}
        className={cn(
          "z-10 inline-block relative text-left text-neutral-900 dark:text-neutral-100 px-2",
          className
        )}
        key={currentWord}>
        {currentWord}
      </motion.span>
    </AnimatePresence>
  );
};

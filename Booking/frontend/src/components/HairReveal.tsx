'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Helper to generate random number between min and max
const random = (min: number, max: number) => Math.random() * (max - min) + min;

interface HairStrandProps {
    id: number;
    isBlownAway: boolean;
}

const HairStrand = ({ id, isBlownAway }: HairStrandProps) => {
    // Generate random initial position and properties for each strand
    // We use useState to keep these stable across re-renders
    const [initialState] = useState(() => {
        // Decide if this strand is part of the "dump" at the bottom (80% chance)
        const isPile = Math.random() > 0.2;

        // Distribution logic:
        // If pile: Top is 75-100%
        // If stray: Top is 0-100%
        const top = isPile ? random(75, 100) : random(0, 100);

        return {
            top,
            left: random(0, 100), // %
            rotation: random(0, 360), // deg
            scale: random(0.5, 1.2),
            // Blow away direction
            exitX: random(-200, 200), // vw
            exitY: random(100, 200), // vh
            exitRotation: random(-720, 720),
        };
    });

    return (
        <motion.div
            className="absolute pointer-events-none"
            style={{
                top: `${initialState.top}%`,
                left: `${initialState.left}%`,
                width: '20px',
                height: '2px', // Thin line representing hair
            }}
            initial={{
                opacity: 0,
                rotate: initialState.rotation,
                scale: initialState.scale,
            }}
            animate={
                isBlownAway
                    ? {
                        x: `${initialState.exitX}vw`,
                        y: `${initialState.exitY}vh`,
                        rotate: initialState.exitRotation,
                        opacity: 0,
                    }
                    : {
                        opacity: 0.8,
                        rotate: initialState.rotation,
                        scale: initialState.scale,
                    }
            }
            transition={{
                duration: random(0.8, 1.5),
                ease: [0.22, 1, 0.36, 1], // Custom easeOut
                delay: isBlownAway ? random(0, 0.2) : 0, // Slight stagger when blowing away
            }}
        >
            {/* SVG Shape for a hair clipping (slightly curved line) */}
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 20 2"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M0 1 Q 10 0, 20 1"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
            </svg>
        </motion.div>
    );
};

export default function HairReveal() {
    const [isBlownAway, setIsBlownAway] = useState(false);
    const [showOverlay, setShowOverlay] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50 && !isBlownAway) {
                setIsBlownAway(true);
                // Remove from DOM after animation completes to save resources
                setTimeout(() => setShowOverlay(false), 2000);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isBlownAway]);

    if (!showOverlay) return null;

    // Generate ~150 strands
    const strands = Array.from({ length: 150 }).map((_, i) => i);

    return (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
            {/* Optional: Add a subtle overlay background that also fades out? 
            Or just the hair? Let's keep just the hair for "cleverness" 
            so the site is visible through the cracks. */}
            {strands.map((i) => (
                <HairStrand key={i} id={i} isBlownAway={isBlownAway} />
            ))}
        </div>
    );
}

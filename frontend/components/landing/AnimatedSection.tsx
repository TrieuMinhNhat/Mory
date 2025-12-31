"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function AnimatedSection({
                                            children,
                                            delay = 0,
                                        }: {
    children: ReactNode;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut", delay }}
        >
            {children}
        </motion.div>
    );
}

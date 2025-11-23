"use client";

import React from "react";
import { Toaster } from "sonner";
import { useTheme } from "@/components/shared/ThemeProvider";

export default function ThemeToaster() {
    const { theme } = useTheme();
    return <Toaster theme={theme} position="top-center" />;
}

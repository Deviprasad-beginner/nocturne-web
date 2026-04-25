export type ReadingMode = "learn" | "feel" | "think" | "sleep";

export interface ReadingModeConfig {
    id: ReadingMode;
    label: string;
    description: string;
    typography: {
        fontFamily: string;
        fontSize: string;
        lineHeight: string;
        letterSpacing: string;
        fontWeight: string;
    };
    layout: {
        maxWidth: string;
        padding: string;
        alignment: "left" | "justify" | "center";
    };
    colors: {
        background: string;
        text: string;
        accent: string;
        selection: string;
    };
    physics: {
        scrollSpeed: number; // multiplier
        scrollBehavior: "smooth" | "auto";
        resistance: number; // 0-1
    };
    features: {
        focusMode: boolean; // dim other paragraphs
        breathingEffect: boolean; // sleep mode only
        autoHideControls: boolean;
    };
}

export const READING_MODES: Record<ReadingMode, ReadingModeConfig> = {
    learn: {
        id: "learn",
        label: "Learn",
        description: "Optimized for clarity, speed, and retention",
        typography: {
            fontFamily: '"Inter", "Roboto", sans-serif',
            fontSize: "18px",
            lineHeight: "1.6",
            letterSpacing: "0.01em",
            fontWeight: "400",
        },
        layout: {
            maxWidth: "680px",
            padding: "40px",
            alignment: "left",
        },
        colors: {
            background: "#ffffff",
            text: "#1a1a1a",
            accent: "#2563eb",
            selection: "#bfdbfe",
        },
        physics: {
            scrollSpeed: 1.2,
            scrollBehavior: "auto",
            resistance: 0,
        },
        features: {
            focusMode: false,
            breathingEffect: false,
            autoHideControls: false,
        },
    },
    feel: {
        id: "feel",
        label: "Feel",
        description: "Deep emotional immersion and connection",
        typography: {
            fontFamily: '"Merriweather", "Georgia", serif',
            fontSize: "20px",
            lineHeight: "1.8",
            letterSpacing: "0.02em",
            fontWeight: "400",
        },
        layout: {
            maxWidth: "720px",
            padding: "60px",
            alignment: "left",
        },
        colors: {
            background: "#fdf6e3", // Solarized light-ish / warm paper
            text: "#5c4033", // Dark brown
            accent: "#d97706",
            selection: "#fde68a",
        },
        physics: {
            scrollSpeed: 1.0,
            scrollBehavior: "smooth",
            resistance: 0.2,
        },
        features: {
            focusMode: true,
            breathingEffect: false,
            autoHideControls: true,
        },
    },
    think: {
        id: "think",
        label: "Think",
        description: "Reflection and philosophical processing",
        typography: {
            fontFamily: '"EB Garamond", "Times New Roman", serif',
            fontSize: "22px",
            lineHeight: "2.0",
            letterSpacing: "0.03em",
            fontWeight: "400",
        },
        layout: {
            maxWidth: "800px",
            padding: "80px",
            alignment: "justify",
        },
        colors: {
            background: "#1a1a1a", // Soft dark
            text: "#e5e5e5",
            accent: "#a8a29e",
            selection: "#404040",
        },
        physics: {
            scrollSpeed: 0.8,
            scrollBehavior: "smooth",
            resistance: 0.5,
        },
        features: {
            focusMode: true,
            breathingEffect: false,
            autoHideControls: true,
        },
    },
    sleep: {
        id: "sleep",
        label: "Sleep",
        description: "Calmness and mental slowing",
        typography: {
            fontFamily: '"Lora", serif',
            fontSize: "19px",
            lineHeight: "2.2",
            letterSpacing: "0.04em",
            fontWeight: "300",
        },
        layout: {
            maxWidth: "600px",
            padding: "100px",
            alignment: "center",
        },
        colors: {
            background: "#000000",
            text: "#6b7280", // Dim gray
            accent: "#374151",
            selection: "#1f2937",
        },
        physics: {
            scrollSpeed: 0.5,
            scrollBehavior: "smooth",
            resistance: 0.8,
        },
        features: {
            focusMode: true,
            breathingEffect: true,
            autoHideControls: true,
        },
    },
};

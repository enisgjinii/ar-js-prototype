declare namespace JSX {
    interface IntrinsicElements {
        'model-viewer': ModelViewerJSX & React.HTMLAttributes<HTMLElement>;
    }
}

interface ModelViewerJSX {
    src?: string;
    'ios-src'?: string;
    alt?: string;
    ar?: boolean | string;
    'ar-modes'?: string;
    'ar-scale'?: string;
    'camera-controls'?: boolean | string;
    'camera-orbit'?: string;
    'camera-target'?: string;
    'environment-image'?: string;
    'exposure'?: string;
    'field-of-view'?: string;
    'max-camera-orbit'?: string;
    'min-camera-orbit'?: string;
    'max-field-of-view'?: string;
    'min-field-of-view'?: string;
    poster?: string;
    'reveal'?: string;
    'shadow-intensity'?: string | number;
    'shadow-softness'?: string | number;
    'auto-rotate'?: boolean | string;
    'auto-rotate-delay'?: string | number;
    'rotation-per-second'?: string;
    'interaction-prompt'?: string;
    'interaction-prompt-style'?: string;
    'interaction-prompt-threshold'?: string | number;
    'loading'?: string;
    'quick-look-browsers'?: string;
    'touch-action'?: string;
    'disable-zoom'?: boolean | string;
    'xr-environment'?: boolean | string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

declare module '*.svg' {
    const value: any;
    export = value;
}  
declare module '*.png' {
    const value: any;
    export = value;
}  

declare module '*.css' {
    const value: any;
    export = value;
}  

import 'react';
declare module 'react' {
    interface CSSProperties {
        [key: `--${string}`]: string | number
    }
}

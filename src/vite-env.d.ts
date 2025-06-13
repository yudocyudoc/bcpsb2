// src/vite-env.d.ts
/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" /> // Esta línea es importante para SVGR
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/react" />



interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    // puedes añadir más variables aquí si las necesitas
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }

  declare module '*.svg?react' {
    import * as React from 'react';
    const ReactComponent: React.FunctionComponent<
      React.SVGProps<SVGSVGElement> & { title?: string }
    >;
    export default ReactComponent;
  }
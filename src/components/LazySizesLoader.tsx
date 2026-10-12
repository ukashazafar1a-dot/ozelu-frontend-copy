// components/LazySizesLoader.js
'use client'; // if using App Router

import { useEffect } from 'react';

export default function LazySizesLoader() {
  useEffect(() => {
    // `require` works better for plugins than dynamic `import()`
    require('lazysizes');
    require('lazysizes/plugins/unveilhooks/ls.unveilhooks');
    // or require('lazysizes/plugins/bgset/ls.bgset');
  }, []);

  return null;
}

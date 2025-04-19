import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  platform: 'node',
  outdir: 'dist',
  format: 'esm',
  sourcemap: true,
  external: ['express'],
}).catch(() => process.exit(1));

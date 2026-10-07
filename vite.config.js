import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
const mediaRoot=path.resolve('node_modules/scratch-blocks/media');
const scratchMedia={
  name:'scratch-local-media',
  configureServer(server){server.middlewares.use('/scratch-media/',(request,response,next)=>{
    const relative=decodeURIComponent((request.url||'').split('?')[0]);
    const file=path.resolve(mediaRoot,'.'+relative);
    if(!file.startsWith(mediaRoot+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return next();
    const types={'.svg':'image/svg+xml','.png':'image/png','.gif':'image/gif','.mp3':'audio/mpeg','.wav':'audio/wav'};
    response.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(response);
  });},
  writeBundle(options){fs.cpSync(mediaRoot,path.join(options.dir,'scratch-media'),{recursive:true});},
};
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/lego_robotics/' : '/',
  plugins:[scratchMedia],
  build: {rollupOptions: {output: {manualChunks: {editor:['codemirror','@codemirror/lang-javascript','@codemirror/theme-one-dark']}}}},
}));

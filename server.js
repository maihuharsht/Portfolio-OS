import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
const root=process.cwd(), types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.pdf':'application/pdf','.webp':'image/webp','.png':'image/png','.ico':'image/vnd.microsoft.icon','.jpeg':'image/jpeg','.jpg':'image/jpeg'};
const server=createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname), route=path==='/'?'/index.html':path, file=resolve(root,`.${route}`);if(!file.startsWith(root))throw new Error();const data=await readFile(file);res.writeHead(200,{'Content-Type':`${types[extname(file)]??'application/octet-stream'}; charset=utf-8`,'Cache-Control':'no-store'});res.end(data)}catch{res.writeHead(404);res.end('Not found')}});
let port=4173;
function listen(){
  const candidate=port++;
  server.once('error',error=>{
    if(error.code==='EADDRINUSE'&&port<=4180){listen();return}
    console.error(`Harshit OS could not start on port ${candidate}: ${error.message}`);
    process.exitCode=1;
  });
  server.listen(candidate,()=>console.log(`Harshit OS: http://localhost:${candidate}`));
}
listen();

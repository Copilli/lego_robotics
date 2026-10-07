import {spawnSync} from 'node:child_process';
for(const [command,args] of [
  [process.execPath,['scripts/import-classroom.mjs']],
  [process.execPath,['scripts/preserve-connection-media.mjs']],
  ['powershell',['-NoProfile','-ExecutionPolicy','Bypass','-File','scripts/import-legacy.ps1']],
  [process.execPath,['scripts/finalize-curriculum.mjs']],
]){const r=spawnSync(command,args,{stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status||1);}

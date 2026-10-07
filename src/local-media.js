export function playbackFile(entry){return entry.webFile||entry.file;}
export function localMediaUrl(entry,original=false){return `${import.meta.env.BASE_URL}media/lego-local/${encodeURIComponent(original?entry.file:playbackFile(entry))}`;}
export async function loadLocalMedia(){
  try{
    const response=await fetch(`${import.meta.env.BASE_URL}media/lego-local/catalog.json`);
    if(!response.ok)return [];
    const catalog=await response.json();
    return Array.isArray(catalog.entries)?catalog.entries.filter(e=>typeof e.file==='string'&&/^[a-f0-9]{64}\.(mp4|wmv|webm|mov|m4v|avi|flv|mpg|mpeg)$/.test(e.file)&&(!e.webFile||/^[a-f0-9]{64}\.mp4$/.test(e.webFile))&&typeof e.sourcePath==='string'&&typeof e.application==='string'&&typeof e.label==='string'):[];
  }catch{return [];}
}
export function chooseLocalLessonVideo(entries,lessonId){
  const matching={start:/QuickStartItems\/1\.mp4$/i,motors:/large motor_marker\.mp4$/i,touch:/Touch sensor_marker\.mp4$/i,color:/Color sensor color_Marker video\.mp4$/i,distance:/ultrasonic sensor_Marker\.mp4$/i};
  return entries.find(e=>e.browserPlayable&&matching[lessonId]?.test(e.sourcePath));
}

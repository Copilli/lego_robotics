import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseLocalLessonVideo,playbackFile} from '../src/local-media.js';
test('each existing practice selects the matching installation video',()=>{
  const sources={start:'Resources/ContentPacks/Retail/en-US/LEGO/QuickStartItems/1.mp4',motors:'projects/large motor_marker.mp4',touch:'projects/Touch sensor_marker.mp4',color:'projects/Color sensor color_Marker video.mp4',distance:'projects/ultrasonic sensor_Marker.mp4'};
  const entries=Object.entries(sources).map(([id,sourcePath])=>({id,sourcePath,browserPlayable:true}));
  for(const id of Object.keys(sources))assert.equal(chooseLocalLessonVideo(entries,id).id,id);
  assert.equal(chooseLocalLessonVideo([], 'touch'),undefined);
  assert.equal(chooseLocalLessonVideo([{...entries[0],browserPlayable:false}],'start'),undefined);
});
test('playback prefers converted MP4 while the original reference stays intact',()=>{
  const original='a'.repeat(64)+'.wmv',converted='b'.repeat(64)+'.mp4';
  const entry={file:original,webFile:converted};assert.equal(playbackFile(entry),converted);assert.equal(entry.file,original);
  assert.equal(playbackFile({file:'native.mp4'}),'native.mp4');
});

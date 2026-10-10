const saved=()=>{try{return JSON.parse(localStorage.getItem('harshit-os'))??{}}catch{return {}}};
export const state={mode:'locked',windows:[],activeId:null,selectedIcon:null,sequence:0,preferences:saved()};
const listeners=new Set();
export function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)}
function changed(){listeners.forEach(fn=>fn(state))}
export function refresh(){changed()}
export function updateAppState(id,patch){const w=state.windows.find(item=>item.id===id);if(!w)return;w.appState={...w.appState,...patch};changed()}
export function save(){try{localStorage.setItem('harshit-os',JSON.stringify(state.preferences))}catch{}}
export function rememberRecentItem(kind,id,title,appId){if(!kind||!id||!title||!appId)return;const item={kind,id,title,appId};state.preferences.recentItems=[item,...(state.preferences.recentItems??[]).filter(x=>x.kind!==kind||x.id!==id)].slice(0,8);save();changed()}
export function openWindow(appId,registry){const app=registry[appId];if(!app)return null;let w=app.singleton===false?null:state.windows.find(item=>item.appId===appId);if(!w){const i=state.windows.length%6,geometry=state.preferences.geometry?.[appId];w={id:`window-${++state.sequence}`,appId,x:geometry?.x??Math.max(12,(innerWidth-app.width)/2+i*24),y:geometry?.y??Math.max(10,(innerHeight-app.height)/2+i*24),width:geometry?.width??app.width,height:geometry?.height??app.height,minimized:false,maximized:false,previous:null,appState:{}};state.windows.push(w)}w.minimized=false;state.activeId=w.id;state.preferences.recent=[appId,...(state.preferences.recent??[]).filter(id=>id!==appId)].slice(0,7);const recent={kind:'Application',id:appId,title:app.name,appId};state.preferences.recentItems=[recent,...(state.preferences.recentItems??[]).filter(item=>item.kind!=='Application'||item.id!==appId)].slice(0,8);save();changed();return w}
export function focusWindow(id,notify=true){const w=state.windows.find(item=>item.id===id);if(!w)return;w.minimized=false;state.activeId=id;if(notify)changed()}
export function closeWindow(id){const closing=state.windows.find(w=>w.id===id);if(!closing)return;state.windows=state.windows.filter(w=>w.id!==id);if(state.selectedIcon===closing.appId)state.selectedIcon=null;if(state.activeId===id)state.activeId=state.windows.filter(w=>!w.minimized).at(-1)?.id??null;changed()}
export function minimizeWindow(id){const w=state.windows.find(item=>item.id===id);if(!w)return;w.minimized=true;if(state.activeId===id)state.activeId=state.windows.filter(item=>!item.minimized).at(-1)?.id??null;changed()}
export function maximizeWindow(id){const w=state.windows.find(item=>item.id===id);if(!w)return;if(!w.maximized){w.previous={x:w.x,y:w.y,width:w.width,height:w.height};w.maximized=true}else restoreWindow(id);if(w.maximized){w.minimized=false;state.activeId=id;changed()}}
export function restoreWindow(id){const w=state.windows.find(item=>item.id===id);if(!w)return;if(w.previous)Object.assign(w,w.previous);w.previous=null;w.maximized=false;w.minimized=false;state.activeId=id;changed()}
export function geometryChanged(id,patch){const w=state.windows.find(item=>item.id===id);if(!w)return;Object.assign(w,patch);state.preferences.geometry={...(state.preferences.geometry??{}),[w.appId]:{x:w.x,y:w.y,width:w.width,height:w.height}};save()}
export function resetDesktop(){state.windows=[];state.activeId=null;state.selectedIcon=null;state.preferences={};save();changed()}
export function updatePreferences(patch){state.preferences={...state.preferences,...patch};save();changed()}
export function setMode(mode){state.mode=mode;changed()}

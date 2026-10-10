import { renderContent } from './views.js';
const registrations=[
 ['about','About Harshit','◎',620,510],['thispc','This PC','▣',690,500],['academics','Academic Performance','▥',920,660],['projects','Projects Explorer','▦',760,570],['skills','Skills & Technologies','⌘',690,550],['github','GitHub Profile','◉',760,560],['leetcode','LeetCode Dashboard','◷',900,660],['resume','Resume Viewer','▤',700,620],['contact','Contact Center','✉',610,500],['achievements','Achievements','✦',600,450],['recycle','Recycle Bin','♲',520,360],['settings','Settings','⚙',560,480]
];
export const applications=Object.fromEntries(registrations.map(([id,name,icon,width,height])=>[id,{id,name,icon,width,height,minWidth:340,minHeight:360,singleton:true,render:win=>renderContent(id,win)}]));
export const shortcuts=['about','thispc','academics','projects','skills','github','leetcode','resume','achievements','contact','recycle'];
export const pins=['about','academics','projects','skills','github','leetcode','resume','contact','settings'];

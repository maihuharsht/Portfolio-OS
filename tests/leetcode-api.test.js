import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchLeetCodeDashboard, LeetCodeApiError, normalizeLeetCodePayloads, readLeetCodeCache, writeLeetCodeCache } from '../src/data/leetcode-api.js';
import { applications } from '../src/apps/registry.js';

const ok=data=>({ok:true,status:200,json:async()=>data});
const profile={matchedUser:{profile:{ranking:12345},submitStats:{acSubmissionNum:[{difficulty:'Easy',count:2},{difficulty:'Medium',count:2},{difficulty:'Hard',count:1}],totalSubmissionNum:[{difficulty:'All',submissions:20}],}}};

test('LeetCode payload normalization maps verified stats and supports documented nested response shapes',()=>{
 const data=normalizeLeetCodePayloads({solved:{solvedProblem:5},profile,skills:{matchedUser:{tagProblemCounts:{fundamental:[{tagName:'array',problemsSolved:4,totalQuestions:20}],intermediate:[{tagName:'binary-search',problemsSolved:2}]}}},contest:{userContestRanking:{rating:1450,globalRanking:8000,attendedContestsCount:3}},contestHistory:[{title:'Weekly Contest 1',rating:1400,ranking:100}],badges:{badges:[{displayName:'Annual Badge',icon:'https://assets.leetcode.com/badge.png'}]},calendar:{submissionCalendar:'{"1735689600":2}'},submissions:[{title:'Two Sum',timestamp:1735689600,statusDisplay:'Accepted'}]},'2025-01-01T00:00:00.000Z');
 assert.deepEqual(data.overview,{totalSolved:5,easy:2,medium:2,hard:1,acceptanceRate:25,ranking:12345});
 assert.equal(data.skills.find(item=>item.name==='array').solved,4);assert.equal(data.contests.rating,1450);assert.equal(data.contests.attended,3);assert.equal(data.contests.history[0].title,'Weekly Contest 1');assert.equal(data.badges[0].name,'Annual Badge');assert.equal(data.activity.calendar[0].count,2);assert.equal(data.activity.submissions[0].title,'Two Sum');assert.equal(data.hasAny,true);
});

test('LeetCode normalization treats null, malformed, and inconsistent metrics as unavailable',()=>{
 const data=normalizeLeetCodePayloads({solved:{totalSolved:99,easySolved:null,mediumSolved:'NaN',hardSolved:-2},profile:{ranking:null,acceptanceRate:140},skills:{skills:[{name:'Arrays',solved:'bad'}]},calendar:{submissionCalendar:'not-json'}},'2025-01-01T00:00:00.000Z');
 assert.deepEqual(data.overview,{totalSolved:99,easy:null,medium:null,hard:null,acceptanceRate:null,ranking:null});assert.deepEqual(data.skills,[]);assert.deepEqual(data.activity.calendar,[]);assert.equal(data.hasAny,true);
});

test('actual alfa response field names populate the profile, topic, activity, and badge views',()=>{
 const data=normalizeLeetCodePayloads({profile:{totalSolved:42,easySolved:30,mediumSolved:12,hardSolved:0,ranking:3090249,submissionCalendar:{'1787616000':5},recentSubmissions:[{title:'Longest Common Prefix',timestamp:'1791382022',statusDisplay:'Accepted'}]},solved:{solvedProblem:42,easySolved:30,mediumSolved:12,hardSolved:0,totalSubmissionNum:[{difficulty:'All',submissions:192},{difficulty:'Easy',submissions:145},{difficulty:'Medium',submissions:47}],acSubmissionNum:[{difficulty:'All',submissions:122},{difficulty:'Easy',submissions:91},{difficulty:'Medium',submissions:31}]},skills:{fundamental:[{tagName:'Array',problemsSolved:29},{tagName:'String',problemsSolved:8}],intermediate:[{tagName:'Binary Search',problemsSolved:3}],advanced:[{tagName:'Dynamic Programming',problemsSolved:2}]},contest:{contestParticipation:[]},badges:{badgesCount:0,badges:[],upcomingBadges:[{name:'Future badge'}]},submissions:{count:1,submission:[{title:'Longest Common Prefix',timestamp:'1791382022',statusDisplay:'Accepted'}]}},'2026-10-10T00:00:00.000Z');
 assert.deepEqual(data.overview,{totalSolved:42,easy:30,medium:12,hard:0,acceptanceRate:63.5,ranking:3090249});assert.equal(data.skills.length,4);assert.equal(data.skills[0].name,'Array');assert.equal(data.activity.calendar[0].count,5);assert.equal(data.activity.submissions[0].title,'Longest Common Prefix');assert.equal(data.contests.attended,0);assert.equal(data.badgeCount,0);assert.deepEqual(data.badges,[]);
});

test('LeetCode dashboard requests documented endpoints and returns partial data when an optional endpoint is rate limited',async()=>{
 const urls=[];const fetchImpl=async url=>{urls.push(url);if(url.endsWith('/contest/history'))return {ok:false,status:429};if(url.endsWith('/solved'))return ok({solvedProblem:5,easySolved:2,mediumSolved:2,hardSolved:1});if(url.endsWith('/profile'))return ok({profile:{ranking:12345}});return ok({})};
 const result=await fetchLeetCodeDashboard({fetchImpl,baseUrl:'https://api.test',now:()=>new Date('2025-01-01T00:00:00.000Z')});
 assert.equal(result.data.overview.totalSolved,5);assert.equal(result.data.overview.ranking,12345);assert.equal(result.endpointStatus.contestHistory,'rate-limit');assert.equal(urls.length,7);assert.ok(urls.some(url=>url.endsWith('/submission?limit=10')));assert.equal(applications.leetcode.name,'LeetCode Dashboard');
});

test('LeetCode failures classify missing profiles, malformed responses, and timeouts',async()=>{
 await assert.rejects(fetchLeetCodeDashboard({baseUrl:'https://api.test',fetchImpl:async url=>url.endsWith('/profile')?{ok:false,status:404}:ok({})}),error=>error instanceof LeetCodeApiError&&error.kind==='not-found');
 await assert.rejects(fetchLeetCodeDashboard({baseUrl:'https://api.test',fetchImpl:async()=>ok({})}),error=>error instanceof LeetCodeApiError&&error.kind==='unavailable');
 await assert.rejects(fetchLeetCodeDashboard({baseUrl:'https://api.test',fetchImpl:async()=>({ok:false,status:429})}),error=>error instanceof LeetCodeApiError&&error.kind==='rate-limit');
 await assert.rejects(fetchLeetCodeDashboard({baseUrl:'https://api.test',fetchImpl:async()=>{throw new TypeError('offline')}}),error=>error instanceof LeetCodeApiError&&error.kind==='network');
 const timeoutFetch=(_url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}));
 await assert.rejects(fetchLeetCodeDashboard({baseUrl:'https://api.test',timeoutMs:2,fetchImpl:timeoutFetch}),error=>error instanceof LeetCodeApiError&&error.kind==='timeout');
});

test('LeetCode cache exposes freshness and stores only normalized successful dashboard data',()=>{
 const values=new Map(),storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};const data=normalizeLeetCodePayloads({solved:{solvedProblem:1,easySolved:1,mediumSolved:0,hardSolved:0}},'2025-01-01T00:00:00.000Z');
 writeLeetCodeCache({data,endpointStatus:{profile:'ok'}},storage);assert.equal(readLeetCodeCache(storage,Date.parse('2025-01-01T00:01:00.000Z')).fresh,true);assert.equal(readLeetCodeCache(storage,Date.parse('2025-01-01T00:10:00.000Z')).fresh,false);
});

test('LeetCode window renders dashboard sections and profile action without fake statistics',()=>{
 const html=applications.leetcode.render({appState:{}});assert.match(html,/Overview/);assert.match(html,/Activity/);assert.match(html,/DSA Skills/);assert.match(html,/Contests/);assert.match(html,/Badges/);assert.match(html,/https:\/\/leetcode\.com\/u\/singhharshit9900\//);assert.doesNotMatch(html,/Problem Explorer/);
 const stale=applications.leetcode.render({appState:{data:normalizeLeetCodePayloads({solved:{solvedProblem:1,easySolved:1,mediumSolved:0,hardSolved:0}},'2025-01-01T00:00:00.000Z'),errorKind:'network',errorMessage:'offline'}});assert.match(stale,/Couldn’t refresh\. Showing saved data\./);assert.match(stale,/Refresh/);assert.doesNotMatch(stale,/alfa-leetcode-api|account credentials/);
});

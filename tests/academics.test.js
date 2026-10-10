import test from 'node:test';
import assert from 'node:assert/strict';
import { percentage, aggregate, subjectAggregates, codingLabSummary, difference, scoreExtremes, countAbove } from '../src/utils/academics/calculations.js';
test('percentage validates inputs and rounds consistently',()=>{assert.equal(percentage(1,3),33.3);assert.equal(percentage(1,8,2),12.5);assert.equal(percentage(null,10),null);assert.equal(percentage(1,0),null);assert.equal(percentage(-1,2),null)});
test('aggregate skips missing and invalid scores, and empty input is null',()=>{assert.deepEqual(aggregate([{obtained:8,max:10},{obtained:null,max:10},{obtained:2,max:0}]),{obtained:8,max:10,percentage:80,count:1});assert.equal(aggregate([]).percentage,null)});
test('subject and semester aggregates stay within selected semester',()=>{const ss=[{id:'a',semesterId:'one',name:'A'},{id:'b',semesterId:'two',name:'B'}];const as=[{subjectId:'a',semesterId:'one',obtained:5,max:10},{subjectId:'b',semesterId:'two',obtained:10,max:10}];assert.equal(subjectAggregates(ss,as,'one')[0].percentage,50)});
test('coding lab reports completed and pending separately',()=>{assert.deepEqual(codingLabSummary([{obtained:9,max:10},{obtained:null,max:10}]),{obtained:9,max:10,percentage:90,count:1,completed:1,pending:1})});
test('difference requires two valid comparable percentages',()=>{assert.equal(difference({percentage:70},{percentage:65.4}),4.6);assert.equal(difference({percentage:null},{percentage:2}),null)});
test('extremes and threshold counts ignore missing marks',()=>{const rows=[{obtained:8,max:10},{obtained:9,max:10},{obtained:null,max:10}];assert.equal(scoreExtremes(rows).highest.record.obtained,9);assert.equal(scoreExtremes([]).lowest,null);assert.equal(countAbove(rows,80),2)});

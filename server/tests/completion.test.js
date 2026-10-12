import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreAnswers, completionEligibility } from '../src/utils/completion.js';
test('quiz scores only matched answers', () => {
 assert.deepEqual(scoreAnswers([{correctIndex:1},{correctIndex:0}],[1,2],50), {score:1,total:2,percentage:50,passed:true});
});
test('quiz rejects incomplete attempts', () => assert.throws(()=>scoreAnswers([{correctIndex:0}],[],70)));
test('certificates require a passed quiz and all lessons', () => {
 assert.equal(completionEligibility(['a','b'],['a'],true),false);
 assert.equal(completionEligibility(['a','b'],['a','b'],false),false);
 assert.equal(completionEligibility([],[],true),false);
 assert.equal(completionEligibility(['a','b'],['b','a'],true),true);
});

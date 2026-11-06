import { describe, expect, it } from 'vitest'
import { checkWrapper, constructTarget, diagonal, displacement, interpretHypothesis, symbolicOutcome, transformMoves, wrappers } from './engine'
import { compileHeadTrace, counterMachine } from './compiler'
import { initialize, machines, run, step } from '../engines/turing'
import { proofs } from './content'
describe('supported formal constructions',()=>{
 for(const target of ['head','halt'] as const){
  it(`${target}: preserves both membership cases and divergence`,()=>{const checked=checkWrapper(wrappers[target]);expect(checked.preservesAcceptance).toBe(true);expect(checked.cases.map(c=>c.targetMember)).toEqual([true,false,false]);expect(checked.motionSafe).toBe(true)})
  it(`${target}: constructs a finite encoded pair on ε without simulating M`,()=>{const c=constructTarget(target,'description of Ω','101');const pair=JSON.parse(c.encoded);expect(pair.input).toBe('');expect(JSON.parse(pair.machine).source).toEqual({machine:'description of Ω',input:'101'});expect(c.program.rules).toEqual(wrappers[target])})
  it(`${target}: has proofs for effective construction, both directions and contradiction`,()=>{const p=proofs[target];expect(p.sourceLanguage).toBe('A_TM');expect(p.obligations.map(o=>o.id)).toEqual(expect.arrayContaining(['computable','constructible','preservation','positive','negative','contradiction']));expect(p.obligations.every(o=>o.proof.length>80)).toBe(true)})
 }
 it.each(['accept','reject'] as const)('diagonal branch %s contradicts H',answer=>{expect(diagonal(answer).actual).not.toBe(answer);expect(diagonal(answer).contradiction).toBe(true)})
 it('rejects faulty wrapper rules instead of declaring all constructions valid',()=>{expect(checkWrapper({...wrappers.halt,onReject:'reject'}).preservesAcceptance).toBe(false);expect(checkWrapper({...wrappers.head,onAccept:'halt'}).preservesAcceptance).toBe(false);expect(checkWrapper({...wrappers.head,leftMacro:'L'}).motionSafe).toBe(false)})
 it('H rejection does not imply source rejection',()=>expect(interpretHypothesis('reject').claim).toContain('run forever'))
 it('rejecting-source counterexample distinguishes the faulty HALT wrapper',()=>{const c=run(machines[1],'1');expect(c.status).toBe('rejected');expect(symbolicOutcome(wrappers.halt,'reject').targetMember).toBe(false);const faultyHalts=c.status!=='running';expect(faultyHalts).toBe(true)})
})
describe('physical left-move compiler',()=>{
 it('preserves displacement and avoids LLL for all words up to length 8',()=>{
  let words=[''];for(let n=0;n<=8;n++){for(const word of words){const compiled=transformMoves([...word] as ('L'|'R'|'S')[]);expect(displacement(compiled)).toBe(displacement(word));expect(compiled).not.toContain('LLL')}words=words.flatMap(w=>['L','R','S'].map(m=>w+m))}
 })
 it.each(machines)('maintains the full tape/head invariant for $name',machine=>{const trace=compileHeadTrace(machine,'1011',25);expect(trace.boundaries.every(b=>b.dataEqual&&b.physicalHead===b.sourceHead)).toBe(true);expect(trace.instructions.filter(t=>t.phase!=='signal').map(t=>t.move).join('')).not.toContain('LLL');expect(trace.tape[0].origin).toBe(true)})
 it('signals only after acceptance',()=>{const trace=compileHeadTrace(machines[0],'1',30);expect(trace.status).toBe('signaled');expect(trace.instructions.slice(-3).map(t=>t.move).join('')).toBe('LLL');expect(trace.instructions.slice(-3).every(t=>t.phase==='signal')).toBe(true)})
 it('rejection and missing transitions cannot signal',()=>{for(const [m,w] of [[machines[1],'1'],[machines[0],'x']] as const){const trace=compileHeadTrace(m,w,20);expect(trace.status).toBe('rejected');expect(trace.instructions.some(t=>t.phase==='signal')).toBe(false)}})
 it('known looping source stays unknown at a finite budget',()=>{const trace=compileHeadTrace(machines[2],'',20);expect(trace.status).toBe('unknown');expect(trace.source.steps).toBe(20);expect(trace.instructions.map(t=>t.move).join('')).not.toContain('LLL')})
 it('handles an initially accepting state and empty initialization',()=>{const trace=compileHeadTrace({name:'A',initial:'yes',accept:['yes'],reject:[],transitions:[]},'',0);expect(trace.status).toBe('signaled');expect(trace.instructions.map(t=>t.move).join('')).toBe('LLL')})
 it('writes only at macro origin, preserving negative cells',()=>{const m={name:'left',initial:'q',accept:['yes'],reject:[],transitions:[{from:'q',read:'1',write:'0',move:'L' as const,to:'q'},{from:'q',read:'_',write:'1',move:'L' as const,to:'yes'}]};const trace=compileHeadTrace(m,'1',4);expect(trace.tape[-1].data).toBe('1');expect(trace.boundaries.every(b=>b.dataEqual&&b.physicalHead===b.sourceHead)).toBe(true)})
 it('provides an executable timeout counterexample',()=>{const m=counterMachine(10001);let c=initialize(m,'');for(let i=0;i<10000;i++)c=step(m,c);expect(c.status).toBe('running');expect(step(m,c).status).toBe('accepted')})
})

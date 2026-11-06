import { describe, expect, it } from 'vitest'
import { initialize, machines, run, step, validate } from './turing'
import { construct, evaluate, provesHaltingToAcceptance } from './reduction'
describe('Turing engine',()=>{
 it.each(machines)('validates $name', m=>expect(validate(m)).toEqual([]))
 it.each([['0','1'],['1','10'],['1011','1100'],['111','1000']])('increments %s to %s',(input,expected)=>{const c=run(machines[0],input);expect(c.status).toBe('accepted');expect(Object.keys(c.tape).map(Number).sort((a,b)=>a-b).map(i=>c.tape[i]).join('')).toBe(expected)})
 it('supports negative tape positions without mutating snapshots',()=>{const c=initialize(machines[0],'1');const next=step(machines[0],c);expect(c.head).toBe(0);expect(next.head).toBe(1);expect(run(machines[0],'1').tape[-1]).toBe('1')})
 it.each([['', 'accepted'],['11','accepted'],['101','accepted'],['1','rejected']])('recognizes parity for %s',(input,status)=>expect(run(machines[1],input).status).toBe(status))
 it('reports a budget limit without inventing a halt',()=>{const c=run(machines[2],'',25);expect(c.steps).toBe(25);expect(c.bounded).toBe(true);expect(c.status).toBe('running')})
 it('halts without acceptance for an undefined transition',()=>expect(run(machines[0],'x').status).toBe('stuck'))
 it('preserves terminal configurations',()=>{const c=run(machines[0],'0');expect(step(machines[0],c)).toBe(c)})
 it('rejects nondeterministic transitions',()=>expect(validate({...machines[0],transitions:[...machines[0].transitions,machines[0].transitions[0]]})).toContain('Duplicate transition: scan, 0'))
})
describe('reduction constructor',()=>{
 it.each(['11','1'])('maps acceptance AND rejection to acceptance (%s)',input=>expect(evaluate(machines[1],input,{trigger:'halts',action:'accept'},100).outcome).toBe('accept'))
 it('does not conflate accepting with halting',()=>expect(evaluate(machines[1],'1',{trigger:'accepts',action:'accept'},100).outcome).toBe('loop'))
 it('reports unknown for a running source',()=>expect(evaluate(machines[2],'',{trigger:'halts',action:'accept'},100).outcome).toBe('unknown'))
 it('maps a stuck source to acceptance under HALT',()=>expect(evaluate(machines[0],'x',{trigger:'halts',action:'accept'},10).outcome).toBe('accept'))
 it('constructs an encoding without executing the source',()=>{const c=construct(machines[2],'1',{trigger:'halts',action:'accept'});expect(JSON.parse(c.encoding).input).toBe('1')})
 it('validates the proof recipe rather than finite observations',()=>{expect(provesHaltingToAcceptance({trigger:'halts',action:'accept'})).toBe(true);expect(provesHaltingToAcceptance({trigger:'accepts',action:'accept'})).toBe(false);expect(provesHaltingToAcceptance({trigger:'halts',action:'reject'})).toBe(false)})
})

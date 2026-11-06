import { initialize, step, validate } from '../engines/turing'
import type { Configuration, Machine } from '../engines/turing'
import type { Move } from './engine'
/** Micro-instructions over a product tape. The origin marker is never overwritten.
 * Pending move words and source state are finite control, not an oracle.
 */
export type Cell = { data:string; origin:boolean }
export type MicroStep = { phase:'initialize'|'simulate'|'signal'; move:Move; write?:string; sourceStep:number }
export type CompiledTrace = { instructions:MicroStep[]; tape:Record<number,Cell>; head:number; source:Configuration; status:'signaled'|'rejected'|'unknown'; boundaries:{physicalHead:number;sourceHead:number;dataEqual:boolean}[] }
export function compileHeadTrace(machine:Machine,input:string,budget:number):CompiledTrace {
 const errors=validate(machine)
 if(errors.length) throw Error(errors.join(' '))
 if(!Number.isInteger(budget)||budget<0||budget>10000)throw Error('Budget must be an integer from 0 to 10000.')
 const instructions:MicroStep[]=[],tape:Record<number,Cell>={0:{data:'_',origin:true}},boundaries:CompiledTrace['boundaries']=[]
 let head=0,source=initialize(machine,input)
 const emit=(move:Move,phase:MicroStep['phase'],write?:string)=>{
  if(write!==undefined)tape[head]={data:write,origin:tape[head]?.origin??false}
  instructions.push({phase,move,write,sourceStep:source.steps})
  head+=move==='L'?-1:move==='R'?1:0
 }
 // Fixed ε input: no erasure sweep. Write the embedded word and return safely.
 for(const symbol of [...input])emit('R','initialize',symbol)
 for(let i=0;i<[...input].length;i++){emit('L','initialize');emit('R','initialize');emit('L','initialize')}
 const boundary=()=>{
  const keys=new Set([...Object.keys(tape),...Object.keys(source.tape)])
  boundaries.push({physicalHead:head,sourceHead:source.head,dataEqual:[...keys].every(k=>(tape[Number(k)]?.data??'_')===(source.tape[Number(k)]??'_'))})
 }
 boundary()
 for(let i=0;i<budget&&source.status==='running';i++){
  const t=machine.transitions.find(t=>t.from===source.state&&t.read===(source.tape[source.head]??'_'))
  if(!t){source=step(machine,source);break}
  const word:Move[]=t.move==='L'?['L','R','L']:[t.move]
  word.forEach((move,j)=>emit(move,'simulate',j===0?t.write:undefined))
  source=step(machine,source);boundary()
 }
 if(source.status==='accepted'){emit('L','signal');emit('L','signal');emit('L','signal')}
 return {instructions,tape,head,source,boundaries,status:source.status==='accepted'?'signaled':source.status==='running'?'unknown':'rejected'}
}
export function counterMachine(acceptAt:number):Machine {
 if(!Number.isInteger(acceptAt)||acceptAt<1||acceptAt>20000)throw Error('Invalid delay')
 return {name:`Accept at ${acceptAt}`,initial:'q0',accept:[`q${acceptAt}`],reject:[],transitions:Array.from({length:acceptAt},(_,i)=>({from:`q${i}`,read:'_',write:'_',move:'R',to:`q${i+1}`}))}
}

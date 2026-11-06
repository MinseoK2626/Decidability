/** A small, explicit calculus for the supported wrapper constructions, not a general theorem prover. */
export type Behavior = 'accept' | 'reject' | 'loop'
export type Target = 'head' | 'halt'
export type Answer = 'accept' | 'reject'
export type Move = 'L' | 'R' | 'S'
export type Wrapper = { target: Target; onAccept: 'LLL' | 'halt'; onReject: 'reject' | 'loop'; leftMacro: string }
export const wrappers: Record<Target, Wrapper> = {
 head: { target:'head', onAccept:'LLL', onReject:'reject', leftMacro:'LRL' },
 halt: { target:'halt', onAccept:'halt', onReject:'loop', leftMacro:'LRL' },
}
export function encodePair(machine: string, input: string) { return JSON.stringify({ machine, input }) }
export function constructTarget(target: Target, machine: string, input: string) {
 const program = { kind:'compiled-wrapper', version:1, source:{machine,input}, rules:wrappers[target], ownInput:'ignored', fixedTargetInput:'' }
 return { program, encoded:encodePair(JSON.stringify(program),'') }
}
export function transformMoves(moves: readonly Move[]) { return moves.map(m=>m==='L'?'LRL':m).join('') }
export function displacement(moves: string) { return [...moves].reduce((x,m)=>x+(m==='L'?-1:m==='R'?1:0),0) }
export function symbolicOutcome(wrapper: Wrapper, behavior: Behavior) {
 if (behavior==='loop') return { targetMember:false, result:'continues simulating forever', movement:'infinite safe simulation', justification:'The predefined source loops; the acceptance-only branch is unreachable.' }
 if (behavior==='accept') return { targetMember:wrapper.target==='halt'||wrapper.onAccept==='LLL', result:wrapper.onAccept==='LLL'?'executes LLL, then halts':'halts', movement:wrapper.target==='head'?'LLL':'', justification:'Source acceptance reaches the positive terminal branch.' }
 return { targetMember:wrapper.target==='halt'&&wrapper.onReject==='reject', result:wrapper.onReject==='loop'?'enters a fixed infinite loop':'rejects without LLL', movement:wrapper.onReject==='loop'?'R repeated forever':'', justification:'Rejection does not reach the acceptance branch.' }
}
export function interpretHypothesis(answer: Answer) { return { sourceAnswer:answer, claim:answer==='accept'?'M accepts w':'M does not accept w (it may reject or run forever)' } }
export function diagonal(answer: Answer) { return { prediction:answer, actual:answer==='accept'?'reject':'accept', contradiction:true } }
export const stages = ['Source instance','Construct M′','Encode target instance','Run H symbolically','Interpret H’s answer','Construct source decider S','Contradiction'] as const
export type ProofObligation = { id:string; title:string; statement:string; proof:string }
export type ProofCase = { behavior:Behavior; claim:string }
export type ReductionProof = {
 id:Target; title:string; sourceLanguage:string; targetLanguage:string; definition:string; sourceInstance:string; targetInstance:string; transformation:string; assumedDecider:string; constructedDecider:string; positiveCase:ProofCase; negativeCase:ProofCase; contradiction:string; notation:string; code:string; obligations:ProofObligation[];
}
export function checkWrapper(wrapper: Wrapper) {
 const cases = (['accept','reject','loop'] as const).map(behavior=>({behavior,...symbolicOutcome(wrapper,behavior)}))
 return {cases, preservesAcceptance:cases.every(c=>c.targetMember===(c.behavior==='accept')),
  motionSafe:wrapper.target!=='head'||wrapper.leftMacro==='LRL',
  computable:true as const}
}

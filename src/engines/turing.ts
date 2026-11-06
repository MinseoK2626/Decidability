export type Transition = { from: string; read: string; write: string; move: 'L' | 'R' | 'S'; to: string }
export type Machine = { name: string; initial: string; accept: string[]; reject: string[]; transitions: Transition[] }
export type Configuration = { state: string; head: number; tape: Record<number, string>; steps: number; status: 'running' | 'accepted' | 'rejected' | 'stuck' }
export function validate(machine: Machine): string[] {
  const errors: string[] = [], keys = new Set<string>()
  if (!machine.initial) errors.push('An initial state is required.')
  if (machine.accept.some(s => machine.reject.includes(s))) errors.push('Accept and reject states must be disjoint.')
  for (const t of machine.transitions) {
    const key = JSON.stringify([t.from, t.read])
    if (keys.has(key)) errors.push(`Duplicate transition: ${t.from}, ${t.read}`)
    keys.add(key)
    if (!t.from || !t.to || [...t.read].length !== 1 || [...t.write].length !== 1 || !['L','R','S'].includes(t.move)) errors.push('Transitions need states, single symbols, and L/R/S movement.')
    if ([...machine.accept, ...machine.reject].includes(t.from)) errors.push(`Halting state ${t.from} has an outgoing transition.`)
  }
  return errors
}
function status(machine: Machine, state: string): Configuration['status'] {
  return machine.accept.includes(state) ? 'accepted' : machine.reject.includes(state) ? 'rejected' : 'running'
}
export function initialize(machine: Machine, input: string): Configuration {
  return { state: machine.initial, head: 0, tape: Object.fromEntries([...input].map((symbol, i) => [i, symbol])), steps: 0, status: status(machine, machine.initial) }
}
export function step(machine: Machine, config: Configuration): Configuration {
  if (config.status !== 'running') return config
  const t = machine.transitions.find(t => t.from === config.state && t.read === (config.tape[config.head] ?? '_'))
  if (!t) return { ...config, status: 'stuck' }
  const tape = { ...config.tape }
  if (t.write === '_') delete tape[config.head]; else tape[config.head] = t.write
  return { tape, state: t.to, head: config.head + (t.move === 'R' ? 1 : t.move === 'L' ? -1 : 0), steps: config.steps + 1, status: status(machine, t.to) }
}
export function run(machine: Machine, input: string, limit = 1000) {
  let config = initialize(machine, input)
  for (let i = 0; i < limit && config.status === 'running'; i++) config = step(machine, config)
  return { ...config, bounded: config.status === 'running' }
}
export const machines: Machine[] = [
  { name: 'Binary increment', initial: 'scan', accept: ['done'], reject: [], transitions: [
    { from:'scan', read:'0', write:'0', move:'R', to:'scan' }, { from:'scan', read:'1', write:'1', move:'R', to:'scan' },
    { from:'scan', read:'_', write:'_', move:'L', to:'carry' }, { from:'carry', read:'1', write:'0', move:'L', to:'carry' },
    { from:'carry', read:'0', write:'1', move:'S', to:'done' }, { from:'carry', read:'_', write:'1', move:'S', to:'done' }] },
  { name: 'Even number of 1s', initial:'even', accept:['yes'], reject:['no'], transitions: [
    { from:'even', read:'1', write:'1', move:'R', to:'odd' }, { from:'odd', read:'1', write:'1', move:'R', to:'even' },
    { from:'even', read:'0', write:'0', move:'R', to:'even' }, { from:'odd', read:'0', write:'0', move:'R', to:'odd' },
    { from:'even', read:'_', write:'_', move:'S', to:'yes' }, { from:'odd', read:'_', write:'_', move:'S', to:'no' }] },
  { name:'Endless scan', initial:'loop', accept:[], reject:[], transitions: ['0','1','_'].map(read => ({ from:'loop', read, write:read, move:'R' as const, to:'loop' })) }
]

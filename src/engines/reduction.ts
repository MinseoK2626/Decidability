import { initialize, step } from './turing'
import type { Machine } from './turing'
export type Trigger = 'halts' | 'accepts'
export type Action = 'accept' | 'reject' | 'loop'
export type Recipe = { trigger: Trigger; action: Action }
export function construct(source: Machine, input: string, recipe: Recipe) {
  return { source, input, recipe, encoding: JSON.stringify({ version: 1, source, input, recipe }) }
}
export function evaluate(source: Machine, input: string, recipe: Recipe, budget: number) {
  let config = initialize(source, input)
  for (let i=0; i<budget && config.status === 'running'; i++) config = step(source, config)
  if (config.status === 'running') return { outcome:'unknown' as const, config, explanation:'The simulation budget was exhausted. This does not prove divergence.' }
  // Missing transitions halt without acceptance, just as explicit rejection does.
  const triggered = recipe.trigger === 'halts' || config.status === 'accepted'
  const outcome = triggered ? recipe.action : 'loop'
  return { outcome, config, explanation: triggered ? `The source ${recipe.trigger === 'halts' ? 'halted' : 'accepted'}; the constructed machine will ${recipe.action}.` : 'The source halted without accepting; the constructed machine loops.' }
}
export function provesHaltingToAcceptance(recipe: Recipe) { return recipe.trigger === 'halts' && recipe.action === 'accept' }

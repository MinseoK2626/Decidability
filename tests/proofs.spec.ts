import { expect, test } from '@playwright/test'
test('traces all seven stages with explicit symbolic H branches',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{level:1})).toContainText('Trace the contradiction')
 await page.getByRole('button',{name:'Inspect proof objects'}).click();await expect(page.getByText('The arbitrary original machine, embedded as finite data.')).toBeVisible()
 for(let stage=1;stage<7;stage++)await page.getByRole('button',{name:'Next proof step'}).click()
 await expect(page.locator('.stage-card')).toContainText('S decides A_TM');await expect(page.getByRole('button',{name:'Next proof step'})).toBeDisabled()
 await page.getByRole('button',{name:'Suppose H rejects'}).click();await page.getByRole('button',{name:/Interpret H/}).click();await expect(page.locator('.stage-card')).toContainText('return REJECT')
 await expect(page.getByText('H rejecting an arbitrary pair')).toBeVisible()
})
test('inspects a safe physical compilation and every source case',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Inspect M′',exact:true}).click();await expect(page.getByText('Finite construction, not a behavior test')).toBeVisible()
 await page.getByLabel('Finite source movement word').fill('LLLL');await expect(page.locator('.motion-comparison')).toContainText('LRLLRLLRLLRL');await expect(page.locator('.motion-comparison')).toContainText('No LLL')
 await page.getByRole('button',{name:'Compile and trace source fixture'}).click();await expect(page.locator('.compiled-trace')).toContainText('Trace outcome: signaled');await expect(page.locator('.compiled-trace')).toContainText('Macro-boundary invariant: preserved')
 await page.getByLabel('Predefined source behavior').selectOption('reject');await expect(page.locator('.symbolic-result')).toContainText('rejects without LLL');await page.getByRole('button',{name:'Compile and trace source fixture'}).click();await expect(page.locator('.compiled-trace')).toContainText('Trace outcome: rejected')
 await page.getByLabel('Predefined source behavior').selectOption('loop');await expect(page.locator('.symbolic-result')).toContainText('continues simulating forever');await page.getByRole('button',{name:'Compile and trace source fixture'}).click();await expect(page.locator('.compiled-trace')).toContainText('Trace outcome: unknown')
 await page.getByText('No accidental LLL in simulation',{exact:true}).click();await expect(page.getByText(/A tape with a left boundary would invalidate/)).toBeVisible()
})
test('HALT proof separates rejection from halting and exports its objects',async({page})=>{
 await page.goto('/');await page.getByLabel('Reduction case study').selectOption('halt');await page.getByLabel('Predefined source behavior').selectOption('reject');await expect(page.locator('.symbolic-result')).toContainText('enters a fixed infinite loop');await expect(page.getByRole('heading',{name:'Rejection counterexample'})).toBeVisible()
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Export proof'}).click();expect((await pending).suggestedFilename()).toBe('proof-halt.json')
})
test('both diagonal branches contradict the hypothetical prediction',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'H predicts acceptance'}).click();await expect(page.locator('.contradiction-result')).toContainText('D(⟨D⟩) rejects')
 await page.getByRole('button',{name:'H predicts nonacceptance'}).click();await expect(page.locator('.contradiction-result')).toContainText('D(⟨D⟩) accepts');await expect(page.locator('.contradiction-result')).toContainText('CONTRADICTION')
})
test('debugger reveals the invalid step, obligation, counterexample and correction',async({page})=>{
 await page.goto('/');for(const id of ['direction','rejection','timeout','nonacceptance']){await page.getByLabel('Choose an invalid argument').selectOption(id);await page.getByRole('button',{name:'Inspect invalid step'}).click();for(const name of ['Invalid step','Violated proof obligation','Precise counterexample','Corrected argument'])await expect(page.getByRole('heading',{name,exact:true})).toBeVisible();await expect(page.locator('.debug-diagnosis')).not.toBeEmpty()}
})
test('proof notebook has no runtime errors or horizontal page overflow',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.getByLabel('Reduction case study')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([])
})

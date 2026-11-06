import { test, expect } from '@playwright/test'
test('executes, halts, rewinds and resets a machine',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Open existing machine tools'}).click();await expect(page.getByRole('heading',{level:1})).toContainText('The Limits of')
 await page.getByLabel('Step interval').fill('50');await page.getByRole('button',{name:'Run',exact:true}).click()
 await expect(page.getByRole('status')).toHaveText('ACCEPTED');await expect(page.getByRole('button',{name:'Run',exact:true})).toBeDisabled()
 await page.getByRole('button',{name:'Back',exact:true}).click();await expect(page.getByRole('status')).toHaveText('READY')
 await page.getByRole('button',{name:'Reset machine'}).click();await expect(page.getByText('HEAD @ 0')).toBeVisible()
})
test('edits and validates custom machines',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Open existing machine tools'}).click();await page.getByRole('button',{name:'Edit machine JSON'}).click()
 await page.getByLabel('Machine JSON').fill('{}');await page.getByRole('button',{name:'Apply machine'}).click();await expect(page.getByRole('alert')).toContainText('schema')
 await page.getByLabel('Machine JSON').fill(JSON.stringify({name:'Custom',initial:'start',accept:['yes'],reject:[],transitions:[{from:'start',read:'1',write:'0',move:'S',to:'yes'}]}))
 await page.getByRole('button',{name:'Apply machine'}).click();await page.getByRole('button',{name:'Step',exact:true}).click();await expect(page.getByRole('status')).toHaveText('ACCEPTED')
})
test('constructs a reduction and distinguishes unknown from divergence',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Open existing machine tools'}).click();await page.getByRole('button',{name:/Reduction Constructor/}).click();await page.getByRole('button',{name:'Test construction'}).click();await expect(page.getByRole('status')).toContainText('ACCEPT')
 await page.getByLabel('Source machine').selectOption('Endless scan');await page.getByRole('button',{name:'Test construction'}).click();await expect(page.getByRole('status')).toContainText('UNKNOWN')
 await page.getByLabel('After the source').selectOption('accepts');await expect(page.getByText('This does not establish HALT')).toBeVisible()
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export construction'}).click();expect((await downloadPromise).suggestedFilename()).toBe('reduction.json')
})
test('layout fits the viewport and browser has no runtime errors',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.getByRole('button',{name:'Open existing machine tools'}).click();await expect(page.getByText('STATE DIAGRAM',{exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([])
})

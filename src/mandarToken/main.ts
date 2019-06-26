import {Builder, By, until, WebDriver} from 'selenium-webdriver'
import { start } from 'repl';

class Main{

    public async start(){
        let driver = await new Builder().forBrowser('firefox').build() 
       
        await driver.get('https://web.whatsapp.com/')
       
        await driver.wait(until.elementLocated(By.css('._2rZZg > div:nth-child(1) > img:nth-child(1)')))
        await driver.findElement(By.css('._2kYeZ > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > span:nth-child(1)')).click()

    }
}
new Main().start()
import {NextResponse} from 'next/server';
import {BrowserContext, chromium, Page} from 'playwright';
import fs from "fs";

const userDataDir = './user-data';


export async function POST(req: Request) {

    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: true, // Show browser
        viewport: {width: 375, height: 812}, // Mobile viewport (iPhone 12)
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Mobile Safari/537.36'
    });

    const page = await context.newPage();

    try {
        const {username} = await req.json();

        // 3- Navigate to followers page
        await page.goto(`https://www.instagram.com/${username}/followers/`);
        await page.waitForTimeout(5000);

        console.log('📢 Fetching followers started ...');

        doWork(username, page, context);

        return NextResponse.json({
            success: true,
        });

    } catch (error) {
        console.error('Error:', error);
        await context.close();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return NextResponse.json({error: (error as unknown).message}, {status: 500});
    }
}



const doWork = async (username: string, page: Page, context: BrowserContext) => {

    const followersSet = new Set<string>();

    while (true) {
        // Extract usernames for mobile layout
        const newFollowers = await page.$$eval('a[href*="/"]', (elements) => {
            return elements
                .map(el => el.textContent?.trim() || '')
                .filter(username => username.length > 0);
        });

        newFollowers.forEach(f => followersSet.add(f));

        console.log(`${newFollowers.length} followers found.`);

        // Scroll down to load more
        await page.evaluate(() => {
            window.scrollBy(0, 500);
        });

        await page.waitForTimeout(5000);

        // Check if we have reached the bottom
        const atBottom = await page.evaluate(() => {
            return window.innerHeight + window.scrollY >= document.body.scrollHeight;
        });

        if (atBottom) break;
    }

    console.log(`✅ Found ${followersSet.size} followers!`);

    // Save followers to a file
    fs.writeFileSync(username + '.json', JSON.stringify([...followersSet], null, 2));

    console.log('📂 Saved followers to followers.json');

    await context.close();
}
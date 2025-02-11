import {NextResponse} from 'next/server';
import {chromium} from 'playwright';

const userDataDir = './user-data';


export async function POST() {

    // const browser = await chromium.launch('user-data', { headless: false }); // Open real browser
    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false, // Show browser
        viewport: {width: 375, height: 812}, // Mobile viewport (iPhone 12)
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Mobile Safari/537.36'
    });


    const page = await context.newPage();

    try {
        // const {username} = await req.json();

        // 1- Open Instagram login page
        await page.goto('https://www.instagram.com/accounts/login/', {timeout: 120000});
        console.log('Waiting for user to log in...');

        // 2- Wait until the user is logged in
        await page.waitForSelector('div[role="menu"]', {timeout: 300000}); // Wait up to 2 min
        console.log('User logged in!');

        await context.close();

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



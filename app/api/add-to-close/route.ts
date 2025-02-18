import {IgApiClient} from "instagram-private-api";
import {NextRequest, NextResponse} from "next/server";
import fs from "fs";


export async function POST(req: NextRequest) {

    const ig = new IgApiClient();

    const data = await req.json()
    const {username, startFrom = 0} = data;

    ig.state.generateDevice(username);
    ig.state.proxyUrl = process.env.NEXT_APP_PROXY || "";

    if (fs.existsSync(`session/${username}.json`)) {
        const session = JSON.parse(fs.readFileSync(`session/${username}.json`, 'utf-8'));
        await ig.state.deserialize(session);
        console.log('Session loaded');
    }


    async function addBatchToCloseFriends(batch: number[]) {
        return new Promise(async (resolve) => {
            console.log(`📥 Adding ${batch.length} followers to close friends...`);
            await ig.friendship.setBesties({add: batch});
            console.log(`✅ ${batch.length} users have been added`);
            console.log("Waiting for break 10 min")
            setTimeout(() => {
                resolve(true)
            }, 60000)
        })
    }


    async function processFollowers() {
        // دریافت اطلاعات کاربر
        const user = await ig.user.searchExact(username);
        const userId = user.pk;

        console.log(`📥 Fetching followers of ${username}...`);

        const followersFeed = ig.feed.accountFollowers(userId);
        let batch: number[] = [];
        let i = 0
        do {
            const items = await followersFeed.items();

            batch.push(...items.map((i) => (i.pk)))

            console.log(`📥 Fetch ${(20 * i) + batch.length} followers...`);

            if (batch.length >= 20) {
                if (((20 * i) + batch.length) < startFrom) {
                    console.log(`📥 Skipped ${(20 * i) + batch.length} followers...`);
                    batch = []
                } else {
                    await addBatchToCloseFriends(batch);
                    batch = []
                }
                i++
            }

        } while (followersFeed.isMoreAvailable());

        if (batch.length > 0) {
            await addBatchToCloseFriends(batch);
        }
    }


    processFollowers().catch(console.error);

    return NextResponse.json({success: true, message: "ربات در حال اجراست"});

}



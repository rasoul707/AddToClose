import {IgApiClient} from "instagram-private-api";
import {NextRequest, NextResponse} from "next/server";
import fs from "fs";


export async function POST(req: NextRequest) {

    const ig = new IgApiClient();

    const data = await req.json()
    const {username, startFrom = 0} = data;

    ig.state.generateDevice(username);
    // ig.state.proxyUrl = "http://127.0.0.1:10808";

    if (fs.existsSync(`session/${username}.json`)) {
        const session = JSON.parse(fs.readFileSync(`session/${username}.json`, 'utf-8'));
        await ig.state.deserialize(session);
        console.log('Session loaded');
    }



    async function addBatchToCloseFriends(batch: number[], i: number) {
        return new Promise(async (resolve) => {
            console.log(`📥 Adding ${batch.length} followers to close friends...`);
            await ig.friendship.setBesties({add: batch});
            console.log(`✅ ${batch.length} users have been added`);
            setTimeout(() => {
                resolve(true)
                console.log("Waiting for break 10 min")
            }, 600000)
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
            for(const follower of items) {
                if (((1000 * i) + batch.length) < startFrom) {
                    console.log(`📥 Skipped ${batch.length} followers to close friends...`);
                    continue;
                    return
                }
                batch.push(follower.pk)
                if(batch.length === 1000){
                    i++
                    await addBatchToCloseFriends(batch, i);
                    batch = []
                }
            }

            console.log(`🔹 Fetch ${batch.length} followers for now...`);

        } while (followersFeed.isMoreAvailable());

        if (batch.length > 0){
            await addBatchToCloseFriends(batch, i);
        }
    }



    processFollowers().catch(console.error);

    return NextResponse.json({success: true, message: "ربات در حال اجراست"});

}



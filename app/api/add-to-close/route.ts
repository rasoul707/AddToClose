import {IgApiClient} from "instagram-private-api";
import {NextRequest, NextResponse} from "next/server";
import fs from "fs";


export async function POST(req: NextRequest) {

    const ig = new IgApiClient();

    const data = await req.json()
    const {username} = data;

    ig.state.generateDevice(username);
    ig.state.proxyUrl = "http://127.0.0.1:10808";

    if (fs.existsSync(`session/${username}.json`)) {
        const session = JSON.parse(fs.readFileSync(`session/${username}.json`, 'utf-8'));
        await ig.state.deserialize(session);
        console.log('Session loaded');
    }


    async function getAllFollowers() {
        // دریافت اطلاعات کاربر
        const user = await ig.user.searchExact(username);
        const userId = user.pk;

        console.log(`📥 Fetching followers of ${username}...`);

        // دریافت لیست کامل فالوورها
        const followersFeed = ig.feed.accountFollowers(userId);
        const followers = [];

        do {
            const items = await followersFeed.items();
            const tt = items.map((f) => ({ id: f.pk, username: f.username }))
            followers.push(...tt);
            console.log(`🔹 Fetch ${followers.length} followers for now...`);
            await addFollowersToCloseFriends(tt)

        } while (followersFeed.isMoreAvailable()); // تا زمانی که داده باقی‌مانده ادامه می‌دهد

        console.log(`✅ Total followers: ${followers.length}`);
        return followers;
    }


    async function addFollowersToCloseFriends(followers: { id: number, username: string }[]) {
        return new Promise(async (resolve) => {
            const followerIds = followers.map(f => f.id);
            console.log('📥 Adding followers to close friends...');
            // افزودن تمام فالوورها به کلوز فرند
            await ig.friendship.setBesties({add: followerIds});
            console.log(`✅ ${followerIds.length} users have been added`);
            setTimeout(() => {
                resolve(true)
            }, 10000)
        })

    }

    getAllFollowers().catch(console.error);

    return NextResponse.json({success: true, message: "ربات در حال اجراست"});

}



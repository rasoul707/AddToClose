import {IgApiClient, IgCheckpointError, IgLoginTwoFactorRequiredError} from "instagram-private-api";
import {NextRequest, NextResponse} from "next/server";
import fs from "fs";


export async function POST(req: NextRequest) {

    const ig = new IgApiClient();

    const data = await req.json()
    const {username, password, twoFactorCode, twoFactorId, twoFactorMethod} = data;


    console.log({username, password, twoFactorId, twoFactorMethod});

    ig.state.generateDevice(username);
    ig.state.proxyUrl = "http://127.0.0.1:10808";
    try {
        if (twoFactorCode && twoFactorId) {
            await ig.account.twoFactorLogin({
                username: username,
                twoFactorIdentifier: twoFactorId,
                verificationCode: twoFactorCode,
                verificationMethod: twoFactorMethod === "sms" ? "1" : "0",
            });
            const response = await ig.account.currentUser();

            const result = response

            const session = await ig.state.serialize();
            fs.writeFileSync(`session/${username}.json`, JSON.stringify(session));
            console.log('Session saved');


            return NextResponse.json(
                {
                    success: true,
                    message: "ورود موفق",
                    user: {
                        id: result.pk,
                        fullName: result.full_name,
                        username: result.username,
                        profile: result.profile_pic_url,
                    },
                }
            )
        } else {
            // تلاش برای ورود
            await ig.account.login(username, password);
            const response = await ig.account.currentUser();

            const result = response

            const session = await ig.state.serialize();
            fs.writeFileSync(`session/${username}.json`, JSON.stringify(session));
            console.log('Session saved');

            return NextResponse.json(
                {
                    success: true,
                    message: "ورود موفق",
                    user: {
                        id: result.pk,
                        fullName: result.full_name,
                        username: result.username,
                        profile: result.profile_pic_url,
                    },
                }
            )
        }
    } catch (error) {
        console.log(error)
        if (error instanceof IgLoginTwoFactorRequiredError) {
            const twoFactorInfo = error.response.body.two_factor_info;
            return NextResponse.json(
                {
                    success: false,
                    message: "تأیید دو مرحله‌ای لازم است!",
                    twoFactorRequired: true,
                    twoFactorId: twoFactorInfo.two_factor_identifier,
                    twoFactorMethod: twoFactorInfo.totp_two_factor_on ? "app" : "sms",
                }
            )
        }
        if (error instanceof IgCheckpointError) {
            return NextResponse.json(
                {
                    success: false,
                    message: "نیاز به تایید ورود از اپلیکیشن",
                }
            )
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "خطا در ورود! اطلاعات نادرست است.",
                    ctx: error,
                },
                {status: 403}
            )
        }
    }

}



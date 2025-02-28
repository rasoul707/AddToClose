'use client';

import {useEffect, useState} from 'react';
import axios from "axios";
import {Avatar, Button, Card, Divider, Input, Spinner} from "@heroui/react";


export default function Home() {

    const [sessionData, setSessionData] = useState<object | null>(null);

    const setSession = (data: object) => {
        localStorage.setItem("igdata", JSON.stringify(data));
        window.location.reload();
    }

    const removeSession = () => {
        localStorage.removeItem("igdata");
        window.location.reload();
    }


    const [isLoading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const auth = async (session) => {
        setLoading(true)
        try {
            await axios.get(`/api/auth?username=${session?.user?.username}`);
            setSessionData(session)
        } catch (error) {
            console.log({error});
            removeSession()
        }
        setLoading(false)
    };


    useEffect(() => {
        const d = window.localStorage.getItem("igdata")
        if (d) {
            auth(JSON.parse(d))
        } else{
            setLoading(false)
        }
    }, []);


    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <Card className="p-8 shadow-xl max-w-md w-full bg-white">
                {(isLoading) && (
                    <div className="flex justify-center items-center w-full">
                        <Spinner />
                    </div>
                )}
                {(!isLoading && !sessionData) && (
                    <Login
                        setSession={setSession}
                    />
                )}
                {(!isLoading && !!sessionData) && (
                    <Dashboard
                        session={sessionData}
                    />
                )}
            </Card>
        </div>
    )
}


const Dashboard = ({session}: {session: object | null}) => {

    const [startFrom, setStartFrom] = useState("0");


    const handleLogout = () => {
        removeSession()
    }

    const removeSession = () => {
        localStorage.removeItem("igdata");
        window.location.reload();
    }


    const [isLoading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    const handleStart = async () => {
        setLoading(true)
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const data = {username: session?.user?.username, startFrom: startFrom}
            await axios.post("/api/add-to-close", data);
            alert("ربات در حال اجراست! برنامه را ببندید و منتظر بمانید")
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            console.log({error: error?.response});
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setStatus(error?.response?.data?.message || "خطایی رخ داده است!");
        }
        setLoading(false)
    };
    // 

    return (
        <>
            <h1 className="text-2xl font-bold text-center text-gray-900 py-4">اضافه کردن به کلور فرند</h1>
            <div className="flex gap-3 flex-col items-center">
                <Avatar
                    className="w-20 h-20 text-large"
                    //eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    src={session?.user?.profile || ""}
                    //eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    name={session?.user.fullName}
                />
                <div className="flex gap-2 text-black font-bold">
                    {/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
                    {/*@ts-expect-error*/}
                    {session?.user.fullName}
                </div>
                <Input
                    type="number"
                    label="شروع از"
                    placeholder="از چه عددی شروع شود؟"
                    fullWidth
                    dir="ltr"
                    value={startFrom}
                    onChange={(e) => setStartFrom(e.target.value)}
                />
                <Button
                    color="success"
                    variant="shadow"
                    fullWidth
                    size="lg"
                    onPress={handleStart}
                    isLoading={isLoading}
                >
                    اجرای ربات
                </Button>
                <Button
                    color="danger"
                    variant="flat"
                    fullWidth
                    size="lg"
                    onPress={handleLogout}
                >
                    خروج
                </Button>
                {status && (
                    <p className="mt-4 text-black text-center">
                        {status}
                    </p>
                )}
            </div>
        </>
    )
}


const Login = ({setSession}: { setSession: (data: object) => void; }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [twoFactorId, setTwoFactorId] = useState("");
    const [twoFactorMethod, setTwoFactorMethod] = useState("");
    const [status, setStatus] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [twoFacLoading, setTwoFacLoading] = useState(false);

    const handleLogin = async () => {
        setLoginLoading(true)
        try {
            const res = await axios.post("/api/auth", {username, password});
            if (res.data.twoFactorRequired) {
                setTwoFactorId(res.data.twoFactorId);
                setTwoFactorMethod(res.data.twoFactorMethod);
                setStatus("کد تأیید دو مرحله‌ای را وارد کنید.");
            } else {
                setStatus(res.data.message);
                setSession({
                    user: res.data.user,
                    sessionId: res.data.sessionId,
                })
            }
        } catch (error) {
            console.log({error});
            setStatus("ورود ناموفق! اطلاعات نادرست است.");
        }
        setLoginLoading(false)
    };

    const handleTwoFactorLogin = async () => {
        setTwoFacLoading(true)
        try {
            const res = await axios.post("/api/login", {
                username,
                password,
                twoFactorCode,
                twoFactorId,
                twoFactorMethod,
            });
            setStatus(res.data.message);
            setSession({
                user: res.data.user,
                sessionId: res.data.sessionId,
            })
        } catch (error) {
            console.log({error});
            setStatus("کد تأیید نادرست است.");
        }
        setTwoFacLoading(false)
    };

    return (
        <>
            <h1 className="text-2xl font-bold text-center text-gray-900 py-4">ورود به اینستاگرام</h1>
            <div className="flex gap-3 flex-col">
                <Input
                    type="text"
                    label="نام کاربری"
                    placeholder="نام کاربری خود را وارد کنید"
                    fullWidth
                    dir="ltr"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                    type="password"
                    label="رمز عبور"
                    placeholder="رمز عبور خود را وارد کنید"
                    fullWidth
                    dir="ltr"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                    color="primary"
                    variant="shadow"
                    fullWidth
                    size="lg"
                    onPress={handleLogin}
                    isLoading={loginLoading}
                    isDisabled={!!twoFactorId}
                >
                    ورود
                </Button>
                {twoFactorId && (
                    <>
                        <Divider/>
                        <Input
                            type="text"
                            label="کد تأیید دو مرحله‌ای"
                            placeholder="کد تأیید را وارد کنید"
                            className="w-full"
                            value={twoFactorCode}
                            onChange={(e) => setTwoFactorCode(e.target.value)}
                        />
                        <Button
                            color="secondary"
                            variant="shadow"
                            fullWidth
                            size="lg"
                            onPress={handleTwoFactorLogin}
                            isLoading={twoFacLoading}
                        >
                            تأیید ورود
                        </Button>
                    </>
                )}
                {status && (
                    <p className="mt-4 text-black text-center">
                        {status}
                    </p>
                )}
            </div>
        </>
    )
}

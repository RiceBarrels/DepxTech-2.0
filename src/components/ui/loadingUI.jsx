"use client"

import { ArrowRightLeftIcon, HeadsetIcon, LightbulbIcon,Loader2Icon,TruckElectricIcon, UserIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export function LoadingUI({text}){
    const [loadingIconNumber, setLoadingIconNumber] = useState(0)
    const loadingIcons = [
        <TruckElectricIcon strokeWidth="1.4" className="size-7/12" />,
        <LightbulbIcon strokeWidth="1.4" className="size-7/12" />,
        <ArrowRightLeftIcon strokeWidth="1.4" className="size-7/12" />,
        <HeadsetIcon strokeWidth="1.4" className="size-7/12" />,
        <UserIcon strokeWidth="1.4" className="size-7/12" />
    ]
    const [textState, setTextState] = useState(false)

    useEffect(()=>{
        if(!textState){
            setTimeout(()=>setTextState(true), 1500)
        }
    },[textState])

    useEffect(()=>{
        setTimeout(()=>{
            if(loadingIconNumber >= loadingIcons.length - 1 ){
                setLoadingIconNumber(0)
            }else{
                setLoadingIconNumber(loadingIconNumber+1)
            }
        },1000)
    },[loadingIconNumber])
    
    return (
        <div className="sm:scale-110 md:scale-130 lg:scale-150 flex flex-col justify-center items-center gap-4">
            <motion.div
                initial={{y: 36}}
                animate={{y: 0}}
                transition={{ type: "spring", stiffness: 300, damping: 10, delay: 1 }}
                className="flex gap-8 justify-center items-center"
            >
                {loadingIcons.map((icon,index)=>{
                    return (
                        <AnimatePresence key={index} mode="popLayout">
                            {loadingIconNumber === index && (
                                <motion.div
                                    key={index}
                                    initial={{opacity:0, scale:0.5, rotate: 90}}
                                    animate={{opacity:1, scale:1, rotate: 0}}
                                    exit={{opacity:0, scale:0.5, rotate: 90}}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className="bg-foreground text-background size-16 rounded-3xl flex justify-center items-center"
                                >
                                    {icon}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )
                })}
                <h1 className="font-extrabold text-3xl">DepxTech</h1>
            </motion.div>
            <div className="flex justify-center items-center gap-2">
                <motion.div
                    initial={{opacity: 0, y: 36}}
                    animate={{opacity: 1, y: 0}}
                    transition={{ type: "spring", stiffness: textState ? 400 : 300, damping: textState ? 25 : 10, delay: textState ? 0 : 1 }}
                    className=""
                    layout
                >
                    <Loader2Icon className="size-6 animate-spin" />
                </motion.div>
                <AnimatePresence mode="popLayout">
                    {textState && text && (
                        <motion.div
                            initial={{opacity: 0, y: 12}}
                            animate={{opacity: 1, y: 0}}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            className=""
                            layout
                        >
                            <p className="text-sm">{text}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
"use client"

import { LoadingUI } from "@/components/ui/loadingUI"


export default function AccountLoading() {

  return <div className="flex h-screen items-center justify-center overflow-hidden">
    <LoadingUI text="Loading accounts..."/>
  </div>
}
// components/MobileLayout.tsx
import React, { ReactNode } from "react";
import { HomeIcon, MagnifyingGlassIcon, ChatBubbleBottomCenterIcon, UserIcon, BellIcon, Bars3BottomLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface MobileLayoutProps {
    title: string;
    children: ReactNode;
}

export default function MobileLayout({ title, children }: MobileLayoutProps) {
    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 flex items-center justify-between bg-white shadow-md h-14 px-4 z-10">
                <button className="p-2">
                    <Bars3BottomLeftIcon className="h-6 w-6 text-gray-700" />
                </button>

                <h1 className="text-lg font-medium text-gray-900">{title}</h1>

                <button className="p-2">
                    <BellIcon className="h-6 w-6 text-gray-700" />
                </button>
            </header>

            {/* Content */}
            <main className="flex-1 pt-14 pb-16 overflow-auto bg-gray-50">
                {children}
            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white shadow-t flex justify-around items-center border-t border-gray-200">
                <Link href="/home" className="flex flex-col items-center text-gray-700">
                    <HomeIcon className="h-6 w-6" />
                    <span className="text-xs mt-1">Accueil</span>
                </Link>

                <Link href="/search" className="flex flex-col items-center text-gray-700">
                    <MagnifyingGlassIcon className="h-6 w-6" />
                    <span className="text-xs mt-1">Recherche</span>
                </Link>

                <Link href="/message" className="flex flex-col items-center text-gray-700">
                    <ChatBubbleBottomCenterIcon className="h-6 w-6" />
                    <span className="text-xs mt-1">Messagerie</span>
                </Link>

                <Link href="/profile" className="flex flex-col items-center text-gray-700">
                    <UserIcon className="h-6 w-6" />
                    <span className="text-xs mt-1">Profil</span>
                </Link>
            </footer>
        </div>
    );
}

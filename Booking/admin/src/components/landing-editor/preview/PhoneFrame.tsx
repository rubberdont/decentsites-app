import React from 'react';

interface PhoneFrameProps {
    children: React.ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
    return (
        <div className="relative w-[340px] h-[680px] bg-white dark:bg-black rounded-[3rem] border-[10px] border-slate-900 shadow-2xl overflow-hidden flex flex-col shrink-0">
            {/* Dynamic Notch/Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-7 bg-slate-900 z-20 flex justify-center rounded-t-[2.2rem]">
                <div className="w-32 h-5 bg-black rounded-b-xl"></div>
            </div>

            {/* Content Area (Scrollable inside phone) */}
            <div className="flex-1 overflow-y-auto bg-white scrollbar-hide relative z-0">
                {children}
            </div>

            {/* Bottom Home Bar */}
            <div className="absolute bottom-1 left-0 right-0 h-4 flex justify-center items-center z-20 pointer-events-none">
                <div className="w-32 h-1 bg-slate-300 rounded-full"></div>
            </div>
        </div>
    );
}
